import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FinanceiroService } from '../../../financeiro/financeiro.service';
import { EmpresaService } from '../../../../core/services/empresa.service';
import { LoginSegundaViaService } from '../login-segunda-via.service'; // Injetando o novo service
import { Contrato } from '../../../../models/contrato.model';
import { Fatura } from '../../../../models/fatura.model';
import { ContratoDto } from '../../../../types/contrato.types';

// Service de 2ª via de boleto.
// Diferente do FinanceiroService (área autenticada)
// Apenas faturas com status "Aberta" ou "Vencida".
// Faturas pagas são ignoradas.
// Não há verificação de NFCom.

@Injectable({
  providedIn: 'root',
})
export class FaturaSegundaViaService {
  private readonly httpClient = inject(HttpClient); // Injetar o HttpClient
  private readonly financeiroService = inject(FinanceiroService);
  private readonly empresaService = inject(EmpresaService);
  private readonly loginSegundaViaService = inject(LoginSegundaViaService);

  private readonly _isLoading = signal<boolean>(false);
  private readonly _contratos = signal<Contrato[]>([]);
  private readonly _contratoSelecionadoId = signal<number | null>(null);

  // Signals segunda-via/login
  readonly isLoading = this._isLoading.asReadonly();
  readonly contratos = this._contratos.asReadonly();

  buscarContratosSegundaVia(): void {
    const token = this.loginSegundaViaService.token2Via();
    if (!token) return;

    this._isLoading.set(true);

    const url = `${this.empresaService.apiUrl}app/contratos/detalhado`;

    // Injeta TOken da 2ª Via
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.httpClient.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const dados = response?.data || response;
        const rawList = Array.isArray(dados) ? dados : dados?.contratos || [];

        // Usa contratoDTO para instanciar as classes
        const contratos = rawList.map((c: ContratoDto) => new Contrato(c));
        this._contratos.set(contratos);
      },
      error: (err) => {
        console.error('Erro ao buscar contratos 2ª via', err);
        this._isLoading.set(false);
      },
      complete: () => {
        this._isLoading.set(false);
      },
    });
  }

  // FILTRA CONTRATOS COM PENDÊNCIA
  // Retorna contratos que possuem 1 fatura não paga
  readonly contratosComPendencia = computed(() =>
    this.contratos().filter((c) => c.faturas.find((f) => !f.pago)),
  );

  // DEFINE CONTRATO ATIVO NA TELA
  // Busca contrato pelo ID selecionado
  // Se não houver ID, ou ID não estiver na lista de pendentes, seleciona o 1º da lista
  readonly contratoSelecionado = computed<Contrato | undefined>(() => {
    const id = this._contratoSelecionadoId();
    const lista = this.contratosComPendencia();

    if (!lista.length) return undefined;

    // Tenta achar o contrato pelo ID. Se undefined, cai no fallback (??) e pega lista[0]
    return (id ? lista.find((c) => c.id === id) : undefined) ?? lista[0];
  });

  // Filtra 'Abertas', ordena por data e retorna APENAS a mais antiga/próxima
  readonly faturasAbertas = computed<Fatura[]>(() => {
    const faturas = this.contratoSelecionado()?.faturas ?? [];
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth();

    return faturas
      .filter((f) => {
        if (f.pago) return false;
        const vencimento = new Date(f.vencimento);
        return vencimento.getFullYear() === anoAtual && vencimento.getMonth() === mesAtual;
      })
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
      .slice(0, 1);
  });

  // FATURAS ATRASADAS
  readonly faturasAtrasadas = computed<Fatura[]>(() => {
    const hoje = new Date();
    const faturas = this.contratoSelecionado()?.faturas ?? [];

    return faturas.filter(
      (f) => !f.pago && (f.situacao === 'Vencida' || new Date(f.vencimento) < hoje),
    );
  });

  // Guarda fatura aberta (MAX 1) com as faturas atrasadas (TODAS)
  readonly faturasPendentes = computed<Fatura[]>(() => [
    ...this.faturasAbertas(),
    ...this.faturasAtrasadas(),
  ]);

  setContratoSelecionado(id: number): void {
    this._contratoSelecionadoId.set(id);
  }

  openBoleto(f: Fatura): void {
    this.financeiroService.openBoleto(f);
  }

  copiarCodigoBarras(f: Fatura): Promise<void> {
    return this.financeiroService.copiarCodigoBarras(f);
  }

  copiarCodigoPix(f: Fatura): void {
    this.financeiroService.copiarCodigoPix(f);
  }
}
