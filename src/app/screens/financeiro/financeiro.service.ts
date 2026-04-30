import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../../core/services/empresa.service';
import { Contrato } from '../../models/contrato.model';
import { Fatura } from '../../models/fatura.model';
import { ContratoDto } from '../../types/contrato.types';
import { Md5 } from 'ts-md5';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/ToastService.service';
import { firstValueFrom } from 'rxjs';
import { ContratoService } from '../servicos/contrato.service';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  private empresaService = inject(EmpresaService);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private contratoService = inject(ContratoService);

  private _contratoSelecionadoId = signal<number | null>(null);

  // Delega para ContratoService — fonte única de verdade para contratos
  public contratos = this.contratoService.contratos;

  readonly contratosComFatura = computed(() => {
    const hoje = new Date();
    const cutoff = new Date(hoje.getFullYear(), hoje.getMonth() - 12, 1).getTime();

    return this.contratoService
      .contratos()
      .filter((c) => c.faturas.length > 0)
      .sort((a, b) => {
        const temRecente = (c: Contrato) =>
          (c.faturas ?? []).some((f) => new Date(f.vencimento).getTime() > cutoff);

        const aRecente = temRecente(a) ? 0 : 1;
        const bRecente = temRecente(b) ? 0 : 1;

        return aRecente - bRecente; // 0 vem antes de 1
      });
  });

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

    // Procurar fatura vencida (prioridade máxima)
    const atrasada = faturas.find((f) => f.estaVencida);
    if (atrasada) return { fatura: atrasada, status: 'atrasado' as const };

    // Procurar fatura do mês atual (não paga)
    const doMesAtual = faturas.find((f) => {
      if (f.pago) return false;
      const vencimento = new Date(f.vencimento);
      return vencimento.getFullYear() === anoAtual && vencimento.getMonth() === mesAtual;
    });
    if (doMesAtual) return { fatura: doMesAtual, status: 'aberto' as const };

    // Última paga
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
    const hojeTs = hoje.getTime();

    // Limite inferior: apenas faturas dos últimos 12 meses
    const cutoffTs = new Date(anoAtual, mesAtual - 12, 1).getTime();

    // Pré-computa o timestamp de cada fatura uma única vez.
    type FaturaComTs = Fatura & { _ts: number; _ano: number; _mes: number };
    const faturasComTs: FaturaComTs[] = faturas.map((f) => {
      const d = new Date(f.vencimento);
      return Object.assign(f, { _ts: d.getTime(), _ano: d.getFullYear(), _mes: d.getMonth() });
    });

    const atrasadas = faturasComTs.filter(
      (f) => !f.pago && (f.situacao === 'Vencida' || f._ts < hojeTs),
    );

    const abertas = faturasComTs.filter((f) => {
      if (f.pago || f.estaVencida || f.situacao === 'Vencida') return false;
      return f._ano === anoAtual && f._mes === mesAtual;
    });

    const pagas = faturasComTs.filter((f) => f.pago || f.situacao === 'Pago');

    atrasadas.sort((a, b) => a._ts - b._ts);
    abertas.sort((a, b) => a._ts - b._ts);
    pagas.sort((a, b) => b._ts - a._ts);

    const anteriores = [...pagas].sort((a, b) => b._ts - a._ts).slice(0, 12);

    const todasFaturas = [...atrasadas, ...abertas, ...anteriores];

    const unique = todasFaturas.filter(
      (f, i, arr) => arr.findIndex((x) => x.idTitulo === f.idTitulo) === i,
    );

    // Remove futuras, limita a 12 meses.
    // Faturas atrasadas (não pagas e já vencidas) sempre aparecem
    return unique.filter(
      (f) =>
        (!f.pago && f._ts < hojeTs) || // atrasadas sempre visíveis
        (f._ts >= cutoffTs && (f._ano < anoAtual || (f._ano === anoAtual && f._mes <= mesAtual))),
    );
  });

  loadContratos() {
    return this.contratoService.buscarContratos();
  }

  setContratoSelecionado(id: number) {
    this._contratoSelecionadoId.set(id);
  }

  // Controle de visibilidade da NFCom verificado via API
  mostrarNfMap = signal<Map<number, boolean>>(new Map());

  gerarMd5(idTitulo: number, empresaDb: string | null): string {
    const hashInput = `hash do print: ${idTitulo}${empresaDb}`;
    const k = Md5.hashStr(hashInput).toLocaleUpperCase();

    return k;
  }

  // Verifica existencia nfs retorna apenas o resultado da busca, não atualiza signal
  private async verificaExistenciaNfCom(f: Fatura): Promise<{ idTitulo: number; existe: boolean }> {
    const url = `${this.empresaService.apiUrl}print/nfcom?e=${f.idEmpresaTj}&id=${f.idTitulo}&k=${f.hashNfcom}`;
    try {
      await firstValueFrom(this.http.head(url));
      return { idTitulo: f.idTitulo, existe: true };
    } catch (e) {
      return { idTitulo: f.idTitulo, existe: false };
    }
  }

  // Coleta todas as notas de TODOS os contratos, faz 1 único set()
  async verificarTodasAsNotas() {
    const faturas = this.contratoService
      .contratos()
      .flatMap((c) => c.faturas || [])
      .filter(
        (f) =>
          f.pago &&
          f.visualizarBoleto &&
          f.hashNfcom &&
          f.idEmpresaTj &&
          !this.mostrarNfMap().has(f.idTitulo),
      );

    if (faturas.length === 0) return;

    // Promise.allSettled: não falha se um HEAD individual der erro de rede
    const resultados = await Promise.allSettled(
      faturas.map((f) => this.verificaExistenciaNfCom(f)),
    );

    const mapaFaturas = new Map(this.mostrarNfMap());

    for (const resultado of resultados) {
      if (resultado.status === 'fulfilled') {
        mapaFaturas.set(resultado.value.idTitulo, resultado.value.existe);
      }
    }
    this.mostrarNfMap.set(mapaFaturas);
  }

  // Ações compartilhadas (usados em financeiro e fatura-2-via)
  openBoleto(f: Fatura) {
    const url = `${environment.apiUrl}print/boleto?id=${f.idTitulo}&k=${this.gerarMd5(f.idTitulo, this.empresaService.empresaAtiva()?.db ?? '')}&local=5`;
    window.open(url, '_blank');
  }

  async copiarCodigoBarras(f: Fatura) {
    const empresa = this.empresaService.empresaAtiva();
    const url = `${environment.apiUrl}print/boleto/BoletoStringGlobal?id=${f.idTitulo}&db=${empresa?.db}&somenteLinha=true&local=1`;
    try {
      const res = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
      if (res) {
        navigator.clipboard.writeText(res.trim());
        this.toastService.showSuccess('Código de barras copiado!');
      }
    } catch (e) {
      this.toastService.showError('Erro ao copiar código de barras.');
    }
  }

  copiarCodigoPix(f: Fatura) {
    if (f.textoImagemQRcodePix) {
      navigator.clipboard.writeText(f.textoImagemQRcodePix);
      this.toastService.showSuccess('Código PIX copiado!');
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
