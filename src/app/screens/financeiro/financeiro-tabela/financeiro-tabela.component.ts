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
  // Lista de faturas a exibir (já filtradas pelo componente pai)
  readonly faturas = input.required<Fatura[]>();

  // Título do card (nome do cliente ou label fixo)
  readonly titulo = input.required<string>();

  readonly nfCom = input<boolean>();
  readonly nf = input<boolean>();
  readonly nfs = input<boolean>();

  // Contrato associado — opcional
  // Presente apenas no modo > 6 contratos (visualização vertical)
  // Quando fornecido, exibe ID, endereço e plano no header do card
  readonly contrato = input<Contrato | null>(null);

  readonly financeiroService = inject(FinanceiroService);

  // Verifica se a fatura tem NFCom disponível (e válida 200)
  temNfCom(f: Fatura): boolean {
    return !!(
      f.visualizarBoleto &&
      f.hashNfcom &&
      this.financeiroService.mostrarNfComMap().get(f.idTitulo)
    );
  }

  // Verifica se a fatura tem NF disponível
  temNf(f: Fatura): boolean {
    return !!(f.visualizarBoleto && f.hashNF);
  }

  // Verifica se a fatura tem NFS disponível
  temNfs(f: Fatura): boolean {
    return !!(f.visualizarBoleto && f.hashNFS);
  }

  // Verifica se exibe a coluna (se pelo menos uma das opções acima for verdadeira para qualquer fatura)
  temNotaFiscal(): boolean {
    return this.faturas().some((f) => this.temNfCom(f) || this.temNf(f));
  }
}
