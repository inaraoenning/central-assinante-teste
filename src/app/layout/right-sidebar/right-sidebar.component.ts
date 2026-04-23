import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RightDrawerService, RightDrawerConfig } from './right-drawer.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { Notificacao } from '../../models/notificacao.model';
import { Router } from '@angular/router';
import { CardNotificacaoComponent } from '../../screens/components/card-notificacao/card-notificacao.component';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule, CardNotificacaoComponent],
  templateUrl: './right-sidebar.component.html',
})
export class RightSidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  config: RightDrawerConfig | null = null;
  private sub!: Subscription;

  // Serviços
  public notificacaoService = inject(NotificacaoService);
  public router = inject(Router);

  THEME_BG: { [key: string]: string } = {
    BLUE: 'bg-blue-200 dark:bg-blue-600 dark:text-blue-100',
    GREEN: 'bg-green-200 dark:bg-green-600 dark:text-green-100',
    PURPLE: 'bg-purple-200 dark:bg-purple-600 dark:text-purple-100',
    ORANGE: 'bg-orange-200 dark:bg-orange-600 dark:text-orange-100',
    PINK: 'bg-pink-200 dark:bg-pink-600 dark:text-pink-100',
    MORE: 'hover:underline cursor-pointer font-medium ',
  };

  getThemeBg(theme: string): string {
    return this.THEME_BG[theme] || '';
  }

  constructor(private rightDrawerService: RightDrawerService) {}

  ngOnInit(): void {
    this.sub = this.rightDrawerService.drawer$.subscribe((state) => {
      this.isOpen = state.isOpen;
      this.config = state.config;
    });
  }

  close(): void {
    this.rightDrawerService.close();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // Lidar com os cliques
  aoClicarNaNotificacao(notificacao: Notificacao): void {
    if (!notificacao.lida) {
      this.notificacaoService.marcarComoLida(notificacao.id);
    }
    this.close(); // Fecha a sidebar
    this.router.navigate([`/app/notificacao`]); // Redireciona
  }

  marcarTodasComoLidas(): void {
    this.notificacaoService.marcarTodasComoLidas();
  }

  irParaPaginaCompleta(): void {
    this.close();
    this.router.navigate(['/app/notificacao']);
  }
}
