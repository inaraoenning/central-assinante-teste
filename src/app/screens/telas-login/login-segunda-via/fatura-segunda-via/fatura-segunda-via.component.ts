import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaturaSegundaViaService } from './fatura-segunda-via.service';

@Component({
  selector: 'app-fatura-segunda-via',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fatura-segunda-via.component.html',
})
export class FaturaSegundaViaComponent {
  readonly faturaSegundaViaService = inject(FaturaSegundaViaService);
  // Signals expostos ao template
  isLoading = this.faturaSegundaViaService.isLoading;
  contratos = this.faturaSegundaViaService.contratos;
  contratosComPendencia = this.faturaSegundaViaService.contratosComPendencia;
  contratoSelecionado = this.faturaSegundaViaService.contratoSelecionado;
  faturasAbertas = this.faturaSegundaViaService.faturasAbertas;
  faturasPendentes = this.faturaSegundaViaService.faturasAtrasadas;

  selecionarContrato(id: number): void {
    this.faturaSegundaViaService.setContratoSelecionado(id);
  }
}
