import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceiroService } from './financeiro.service';
import { EmpresaService } from '../../core/auth/empresa.service';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financeiro.component.html',
})
export class FinanceiroComponent implements OnInit {
  readonly financeiroService = inject(FinanceiroService);
  private readonly empresaService = inject(EmpresaService);

  // Signals expostos ao template via service
  contratos = this.financeiroService.contratos;
  contratosComFatura = this.financeiroService.contratosComFatura;
  contratoSelecionado = this.financeiroService.contratoSelecionado;
  faturaAtual = this.financeiroService.faturaAtual;
  listaFaturas = this.financeiroService.listaFaturas;
  isLoading = this.financeiroService.isLoading;
  empresaAtiva = this.empresaService.empresaAtiva;

  ngOnInit(): void {
    this.financeiroService.loadContratos().subscribe(() => {
      this.financeiroService.verificarTodasAsNotas();
    });
  }

  selecionarContrato(id: number) {
    this.financeiroService.setContratoSelecionado(id);
    setTimeout(() => this.financeiroService.verificarTodasAsNotas(), 50);
  }
}
