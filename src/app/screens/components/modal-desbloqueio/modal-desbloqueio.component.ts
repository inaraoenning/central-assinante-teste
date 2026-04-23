import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesbloqueioService } from './desbloqueio.service';
import { FinanceiroService } from '../../financeiro/financeiro.service';
import { ClienteService } from '../../meus-dados/cliente.service';

@Component({
  selector: 'app-modal-desbloqueio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-desbloqueio.component.html',
})
export class ModalDesbloqueioComponent {
  private desbloqueioService = inject(DesbloqueioService);
  private financeiroService = inject(FinanceiroService);
  private clienteService = inject(ClienteService);

  public isSubmitting = signal(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  openModal() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    const modal = document.getElementById('modal-desbloqueio') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  closeModal() {
    const modal = document.getElementById('modal-desbloqueio') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  }

  confirmarDesbloqueio() {
    const contrato = this.financeiroService.contratoSelecionado();
    const cliente = this.clienteService.clienteAtual();

    if (!contrato || !cliente) {
      this.errorMessage.set('Não foi possível identificar o contrato ou o cliente.');
      return;
    }

    if (!contrato.hashDesbloqueioTemporario) {
      this.errorMessage.set('Contrato não possui código de desbloqueio temporário.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      k: contrato.hashDesbloqueioTemporario,
      db: cliente.db,
      codigo_cliente: contrato.codigoCliente || cliente.codigo,
    };

    this.desbloqueioService.desbloqueioTemporario(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.successMessage.set(res.mensagem || 'Desbloqueio realizado com sucesso!');
        } else {
          this.errorMessage.set(res.mensagem || 'Falha ao processar desbloqueio.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.mensagem || 'Erro interno na comunicação com servidor.');
      },
    });
  }
}
