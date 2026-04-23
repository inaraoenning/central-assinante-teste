import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardNotificacaoComponent } from '../components/card-notificacao/card-notificacao.component';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-notificacao',
  standalone: true,
  imports: [CommonModule, CardNotificacaoComponent],
  templateUrl: './notificacao.component.html',
})
export class NotificacaoComponent implements OnInit {
  public notificacaoService = inject(NotificacaoService);

  ngOnInit(): void {
    this.notificacaoService.carregarNotificacoes();
  }

  marcarTodasComoLidas(): void {
    this.notificacaoService.marcarTodasComoLidas();
  }
}
