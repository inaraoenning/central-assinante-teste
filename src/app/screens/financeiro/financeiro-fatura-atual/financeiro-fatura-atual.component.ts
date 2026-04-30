import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fatura } from '../../../models/fatura.model';
import { FinanceiroService } from '../financeiro.service';

export type FaturaAtualData = {
  fatura: Fatura;
  status: 'atrasado' | 'aberto' | 'pago';
};

@Component({
  selector: 'app-financeiro-fatura-atual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financeiro-fatura-atual.component.html',
})
export class FinanceiroFaturaAtualComponent {
  readonly atual = input.required<FaturaAtualData | null>();
  readonly financeiroService = inject(FinanceiroService);
}
