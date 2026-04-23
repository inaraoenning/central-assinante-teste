import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../../core/auth/empresa.service';
import { Contrato } from '../../models/contrato.model';
import { Fatura } from '../../models/fatura.model';
import { map, finalize, tap } from 'rxjs/operators';
import { ContratoDto } from '../../types/contrato.types';
import { Md5 } from 'ts-md5';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  private empresaService = inject(EmpresaService);
  private http = inject(HttpClient);

  private _contratos = signal<Contrato[]>(this.carregarDoCache());
  private _isLoading = signal<boolean>(false);
  private _contratoSelecionadoId = signal<number | null>(null);

  // Recuperar do LocalStorage ao abrir (F5)
  private carregarDoCache(): Contrato[] {
    const cached = localStorage.getItem('@App:contratos');
    if (cached) {
      try {
        const rawList = JSON.parse(cached);
        return rawList.map((c: ContratoDto) => new Contrato(c));
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  // Read-only signals
  public contratos = computed(() => this._contratos());
  public isLoading = computed(() => this._isLoading());

  contratosComFatura = computed(() =>
    this._contratos().filter((c) => c.faturas && c.faturas.length > 0),
  );

  contratoSelecionado = computed(() => {
    const id = this._contratoSelecionadoId();
    if (id) {
      return this.contratosComFatura().find((c) => c.id === id) || this.contratosComFatura()[0];
    }
    return this.contratosComFatura()[0];
  });

  faturasDoContrato = computed(() => this.contratoSelecionado()?.faturas || []);

  faturaAtual = computed(() => {
    const faturas = this.faturasDoContrato();
    if (faturas.length === 0) return null;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // 1. Procurar fatura vencida (prioridade máxima)
    const atrasada = faturas.find((f) => f.estaVencida);
    if (atrasada) return { fatura: atrasada, status: 'atrasado' as const };

    // 2. Procurar fatura do mês atual (não paga)
    const doMesAtual = faturas.find((f) => {
      if (f.pago) return false;
      const vencimento = new Date(f.vencimento);
      return vencimento.getFullYear() === anoAtual && vencimento.getMonth() === mesAtual;
    });
    if (doMesAtual) return { fatura: doMesAtual, status: 'aberto' as const };

    // 3. Última paga
    const ultimaPaga = [...faturas]
      .filter((f) => f.pago)
      .sort((a, b) => new Date(b.vencimento).getTime() - new Date(a.vencimento).getTime())[0];
    if (ultimaPaga) return { fatura: ultimaPaga, status: 'pago' as const };

    return null;
  });

  listaFaturas = computed(() => {
    const faturas = this.faturasDoContrato();
    if (faturas.length === 0) return [];

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Filtros
    const atrasadas = faturas.filter(
      (f) => !f.pago && (f.situacao === 'Vencida' || new Date(f.vencimento) < hoje),
    );

    const abertas = faturas.filter((f) => {
      if (f.pago || f.estaVencida || f.situacao === 'Vencida') return false;
      const venc = new Date(f.vencimento);
      return venc.getFullYear() === anoAtual && venc.getMonth() === mesAtual;
    });

    const pagas = faturas.filter((f) => f.pago || f.situacao === 'Pago');

    // Ordenação
    atrasadas.sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
    abertas.sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
    pagas.sort((a, b) => new Date(b.vencimento).getTime() - new Date(a.vencimento).getTime());

    const anteriores = [...atrasadas, ...pagas]
      .sort((a, b) => new Date(b.vencimento).getTime() - new Date(a.vencimento).getTime())
      .slice(0, 12);

    const todasFaturas = [...atrasadas, ...abertas, ...anteriores];

    // Unique by idTitulo
    const unique = todasFaturas.filter(
      (f, i, arr) => arr.findIndex((x) => x.idTitulo === f.idTitulo) === i,
    );

    // Filter out future
    return unique.filter((f) => {
      const venc = new Date(f.vencimento);
      return (
        venc.getFullYear() < anoAtual ||
        (venc.getFullYear() === anoAtual && venc.getMonth() <= mesAtual)
      );
    });
  });

  loadContratos() {
    this._isLoading.set(true);
    const url = `${this.empresaService.apiUrl}app/contratos/detalhado`;

    return this.http.get<any>(url).pipe(
      tap((res) => {
        const payload = res?.data || res;
        const rawList = Array.isArray(payload) ? payload : payload?.contratos || [];
        // Salva string bruta no storage para F5
        localStorage.setItem('@App:contratos', JSON.stringify(rawList));
      }),
      map((res) => {
        const payload = res?.data || res;
        const rawList = Array.isArray(payload) ? payload : payload?.contratos || [];
        const contratos = rawList.map((c: ContratoDto) => new Contrato(c));
        this._contratos.set(contratos);
        return contratos;
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  setContratoSelecionado(id: number) {
    this._contratoSelecionadoId.set(id);
  }

  /** Injeta lista de contratos diretamente no signal (mock ou resposta do backend de 2ª via) */
  setContratosMock(rawList: ContratoDto[]) {
    const contratos = rawList.map((c) => new Contrato(c));
    this._contratos.set(contratos);
  }

  // Controle de visibilidade da NFCom verificado via API
  mostrarNfMap = signal<Map<number, boolean>>(new Map());

  gerarMd5(idTitulo: number, empresaDb: string | null): string {
    const hashInput = `hash do print: ${idTitulo}${empresaDb}`;
    const k = Md5.hashStr(hashInput).toLocaleUpperCase();

    return k;
  }

  async verificarNfCom(f: Fatura) {
    const url = `${this.empresaService.apiUrl}print/nfcom?e=${f.idEmpresaTj}&id=${f.idTitulo}&k=${f.hashNfcom}`;
    try {
      // HEAD request para validar existência do documento (status 200)
      await this.http.head(url).toPromise();
      const novoMapa = new Map(this.mostrarNfMap());
      novoMapa.set(f.idTitulo, true);
      this.mostrarNfMap.set(novoMapa);
    } catch (e) {
      const novoMapa = new Map(this.mostrarNfMap());
      novoMapa.set(f.idTitulo, false);
      this.mostrarNfMap.set(novoMapa);
    }
  }

  verificarTodasAsNotas() {
    const faturas = this.listaFaturas();
    faturas.forEach((f) => {
      // Regra: Deve estar paga, permitir visualização de boleto (regra de negócio) e possuir os dados mínimos da NFCom
      if (f.pago && f.visualizarBoleto && f.hashNfcom && f.idEmpresaTj) {
        // Se já verificamos, não repete
        if (this.mostrarNfMap().has(f.idTitulo)) return;
        this.verificarNfCom(f);
      }
    });
  }

  // ─── Métodos de ação compartilhados (usados em financeiro e fatura-2-via) ───

  isBoleto(f: Fatura): boolean {
    return (
      f.idPagamento == 21 ||
      f.idPagamento == 23 ||
      f.idPagamento == 24 ||
      f.idPagamento == 26 ||
      f.pagamento?.toLowerCase().includes('boleto')
    );
  }

  openBoleto(f: Fatura) {
    const url = `${environment.apiUrl}print/boleto?id=${f.idTitulo}&k=${this.gerarMd5(f.idTitulo, this.empresaService.empresaAtiva()?.db ?? '')}&local=5`;
    window.open(url, '_blank');
  }

  async copiarCodigoBarras(f: Fatura) {
    const empresa = this.empresaService.empresaAtiva();
    const url = `${environment.apiUrl}print/boleto/BoletoStringGlobal?id=${f.idTitulo}&db=${empresa?.db}&somenteLinha=true&local=1`;
    try {
      const res = await this.http.get(url, { responseType: 'text' }).toPromise();
      if (res) {
        navigator.clipboard.writeText(res.trim());
        alert('Código de barras copiado!');
      }
    } catch (e) {
      alert('Erro ao copiar código de barras.');
    }
  }

  copiarCodigoPix(f: Fatura) {
    if (f.textoImagemQRcodePix) {
      navigator.clipboard.writeText(f.textoImagemQRcodePix);
      alert('Código PIX copiado!');
    }
  }

  openNFcom(f: Fatura) {
    const url = `${environment.apiUrl}print/nfcom?e=${f.idEmpresaTj}&id=${f.idTitulo}&k=${f.hashNfcom}`;
    window.open(url, '_blank');
  }

  openNF(f: Fatura) {
    const url = `${environment.apiUrl}/boleto/nf.aspx?id=${f.idTitulo}&k=${f.hashNF}`;
    window.open(url, '_blank');
  }

  openNFS(f: Fatura) {
    const url = `${environment.apiUrl}/boleto/nfs.aspx?id=${f.idTitulo}&k=${f.hashNFS}`;
    window.open(url, '_blank');
  }
}
