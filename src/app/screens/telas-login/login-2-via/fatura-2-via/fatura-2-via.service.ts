import { Injectable, inject, computed, signal } from '@angular/core';
import { FinanceiroService } from '../../../financeiro/financeiro.service';
import { EmpresaService } from '../../../../core/auth/empresa.service';
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
export class Fatura2ViaService {
  private readonly financeiroService = inject(FinanceiroService);
  readonly empresaService = inject(EmpresaService);

  // Estado próprio
  private _contratoSelecionadoId = signal<number | null>(null);
  readonly isLoading = this.financeiroService.isLoading;

  // Contratos: delega ao FinanceiroService
  readonly contratos = this.financeiroService.contratos;

  // Contratos que possuam ao menos uma fatura ABERTA ou VENCIDA.
  readonly contratosComPendencia = computed(() =>
    this.contratos().filter((c) => c.faturas.some((f) => !f.pago)),
  );

  // Contrato selecionado
  readonly contratoSelecionado = computed<Contrato | undefined>(() => {
    const id = this._contratoSelecionadoId();
    const lista = this.contratosComPendencia();
    if (!lista.length) return undefined;
    return (id ? lista.find((c) => c.id === id) : undefined) ?? lista[0];
  });

  // Faturas filtradas: APENAS abertas e vencidas
  readonly faturasAbertas = computed<Fatura[]>(() => {
    const faturas = this.contratoSelecionado()?.faturas ?? [];
    return faturas
      .filter((f) => !f.pago)
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
  });

  setContratoSelecionado(id: number): void {
    this._contratoSelecionadoId.set(id);
  }

  /** Carrega dados via endpoint de login-2-via (backend) */
  carregarContratos(rawList: ContratoDto[]): void {
    this.financeiroService.setContratosMock(rawList);
  }

  // Proxy dos métodos de ação de boleto/pix do FinanceiroService
  isBoleto(f: Fatura): boolean {
    return this.financeiroService.isBoleto(f);
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
