import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { HeaderComponent } from './header/header.component';
// import { RightSidebarComponent } from './right-sidebar/right-sidebar.component';
import { ModalComponent } from './modal/modal.component';
import { ToastService } from '../core/services/ToastService.service';
// import { NotificacaoService } from '../core/services/notificacao.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LeftSidebarComponent,
    HeaderComponent,
    //RightSidebarComponent,
    ModalComponent,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  // Injetamos o serviço como public para o template ter acesso
  public toastService = inject(ToastService);
  // private notificacaoService = inject(NotificacaoService);

  // ngOnInit(): void {
  //   this.notificacaoService.carregarNotificacoes();
  // }
}
