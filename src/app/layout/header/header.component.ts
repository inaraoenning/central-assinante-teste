import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/auth/auth.service';
import { RightDrawerService } from '../right-sidebar/right-drawer.service';
import { ClienteService } from '../../screens/meus-dados/cliente.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  themes: string[] = [];
  currentTheme = 'light';

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private rightDrawerService: RightDrawerService,
  ) {}

  public notificacao = inject(NotificacaoService);
  public clienteService = inject(ClienteService);

  ngOnInit(): void {
    this.themes = this.themeService.themes;
    this.themeService.theme$.subscribe((t) => (this.currentTheme = t));
  }

  setTheme(theme: string): void {
    this.themeService.setTheme(theme);
  }

  openNotifications(): void {
    this.rightDrawerService.open({ header: 'Notifications', bodyType: 'NOTIFICATION' });
  }

  logout(): void {
    this.authService.logout();
  }
}
