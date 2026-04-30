import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceiroService } from './financeiro.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { Contrato } from '../../models/contrato.model';
import { Fatura } from '../../models/fatura.model';
import { FinanceiroFaturaAtualComponent } from './financeiro-fatura-atual/financeiro-fatura-atual.component';
import { FinanceiroTabelaComponent } from './financeiro-tabela/financeiro-tabela.component';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FinanceiroFaturaAtualComponent, FinanceiroTabelaComponent],
  templateUrl: './financeiro.component.html',
})
export class FinanceiroComponent implements OnInit {
  readonly financeiroService = inject(FinanceiroService);
  private readonly empresaService = inject(EmpresaService);

  readonly isLoading = signal<boolean>(true);

  // Signals expostos ao template via service
  contratosComFatura = this.financeiroService.contratosComFatura;
  contratoSelecionado = this.financeiroService.contratoSelecionado;
  faturaAtual = this.financeiroService.faturaAtual;
  listaFaturas = this.financeiroService.listaFaturas;

  ngOnInit() {
    this.isLoading.set(true);
    this.financeiroService.loadContratos().subscribe(async () => {
      await this.financeiroService.verificarTodasAsNotas();
      this.isLoading.set(false);
    });
  }

  selecionarContrato(id: number) {
    this.financeiroService.setContratoSelecionado(id);
  }

  // Faturas dos últimos 12 meses para um contrato específico.
  // Faturas atrasadas (não pagas e já vencidas) sempre aparecem.
  // Usado na visão > 6 contratos.
  getFaturas(contrato: Contrato): Fatura[] {
    const hoje = new Date();
    const hojeTs = hoje.getTime();
    const cutoffTs = new Date(hoje.getFullYear(), hoje.getMonth() - 12, 1).getTime();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();

    return (contrato.faturas || []).filter((f) => {
      const ts = new Date(f.vencimento).getTime();
      const d = new Date(f.vencimento);
      const ano = d.getFullYear();
      const mes = d.getMonth();

      if (!f.pago && ts < hojeTs) return true;
      return ts >= cutoffTs && (ano < anoAtual || (ano === anoAtual && mes <= mesAtual));
    });
  }
}
