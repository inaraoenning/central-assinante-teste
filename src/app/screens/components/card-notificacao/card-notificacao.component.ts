import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notificacao } from '../../../models/notificacao.model'; // Ajuste o caminho

@Component({
  selector: 'app-card-notificacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-notificacao.component.html',
})
export class CardNotificacaoComponent {
  // Injeção de dependência moderna (substitui o constructor)
  // Recebe a notificação do componente pai (Sidebar ou Página)
  @Input({ required: true }) notificacao!: Notificacao;

  // Emite um evento quando o usuário clica no card
  @Output() cardClicado = new EventEmitter<Notificacao>();

  onClick(): void {
    this.cardClicado.emit(this.notificacao);
  }
}
