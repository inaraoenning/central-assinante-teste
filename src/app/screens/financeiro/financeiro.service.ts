import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../../core/auth/empresa.service';
import { Contrato } from '../../models/contrato.model';
import { Fatura } from '../../models/fatura.model';
import { map, finalize, tap } from 'rxjs/operators';
import { ContratoDto } from '../../types/contrato.types';

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
}
