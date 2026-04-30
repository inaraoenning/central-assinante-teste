import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fatura } from '../../../models/fatura.model';
import { Contrato } from '../../../models/contrato.model';
import { FinanceiroService } from '../financeiro.service';

@Component({
  selector: 'app-financeiro-tabela',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financeiro-tabela.component.html',
})
export class FinanceiroTabelaComponent {
  /** Lista de faturas a exibir (já filtradas pelo componente pai). */
  readonly faturas = input.required<Fatura[]>();

  /** Título do card (nome do cliente ou label fixo). */
  readonly titulo = input.required<string>();

  /**
   * Contrato associado — opcional.
   * Presente apenas no modo > 6 contratos (visualização vertical).
   * Quando fornecido, exibe ID, endereço e plano no header do card.
   */
  readonly contrato = input<Contrato | null>(null);

  readonly financeiroService = inject(FinanceiroService);

  /** Verifica se alguma fatura da lista possui NF disponível. */
  temNotaFiscal(): boolean {
    return this.faturas().some(
      (f) => f.pago && f.visualizarBoleto && (f.hashNfcom || f.hashNF || f.hashNFS),
    );
  }
}
