import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  // Login dinâmico do site da empresa
  {
    path: 'login',
    loadComponent: () =>
      import('./screens/telas-login/login/login.component').then((m) => m.LoginComponent),
  },

  // Login Neutro CPF/CNPJ e Selecionar Empresa
  {
    path: 'login-selecao',
    loadComponent: () =>
      import('./screens/telas-login/login-selecao/login-selecao.component').then(
        (m) => m.LoginSelecaoComponent,
      ),
  },
  {
    path: 'login-segunda-via',
    loadComponent: () =>
      import('./screens/telas-login/login-segunda-via/login-segunda-via.component').then(
        (m) => m.LoginSegundaViaComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./screens/telas-login/recuperar-senha/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
    children: [
      // Etapa 1 - Verificar identidade (CPF + data de nascimento)
      {
        path: '',
        loadComponent: () =>
          import('./screens/telas-login/recuperar-senha/recuperar/recuperar.component').then(
            (m) => m.RecuperarComponent,
          ),
      },
      // Etapa 2 - Confirmar e enviar link por e-mail
      {
        path: 'redefinir',
        loadComponent: () =>
          import('./screens/telas-login/recuperar-senha/redefinir/redefinir.component').then(
            (m) => m.RedefinirComponent,
          ),
      },
      // Tela de confirmação de e-mail enviado
      {
        path: 'confirmado',
        loadComponent: () =>
          import('./screens/telas-login/recuperar-senha/confirmado/confirmado.component').then(
            (m) => m.ConfirmadoComponent,
          ),
      },
      // Etapa 3 - Definir nova senha (acessado via link no e-mail)
      {
        path: 'alterar/:hash',
        loadComponent: () =>
          import('./screens/telas-login/recuperar-senha/alterar/alterar.component').then(
            (m) => m.AlterarComponent,
          ),
      },
    ],
  },

  // Rotas protegidas (dentro do layout)
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./screens/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'meus-dados',
        loadComponent: () =>
          import('./screens/meus-dados/meus-dados.component').then((m) => m.MeusDadosComponent),
      },
      {
        path: 'financeiro',
        loadComponent: () =>
          import('./screens/financeiro/financeiro.component').then((m) => m.FinanceiroComponent),
      },
      {
        path: 'protocolos',
        loadComponent: () =>
          import('./screens/protocolos/protocolos.component').then((m) => m.ProtocolosComponent),
      },
      {
        path: 'app-servicos',
        loadComponent: () =>
          import('./screens/servicos/servicos.component').then((m) => m.ServicosComponent),
      },
      {
        path: 'aplicativo',
        loadComponent: () =>
          import('./screens/aplicativo/aplicativo.component').then((m) => m.AplicativoComponent),
      },
      {
        path: 'suporte',
        loadComponent: () =>
          import('./screens/suporte/suporte.component').then((m) => m.SuporteComponent),
      },
      // {
      //   path: 'notificacao',
      //   loadComponent: () =>
      //     import('./screens/notificacao/notificacao.component').then((m) => m.NotificacaoComponent),
      // },
      {
        path: '404',
        loadComponent: () =>
          import('./screens/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // {
      //   path: 'getting-started',
      //   loadComponent: () =>
      //     import('./screens/docs/getting-started/getting-started.component').then(
      //       (m) => m.GettingStartedComponent,
      //     ),
      // },
      // {
      //   path: 'components',
      //   loadComponent: () =>
      //     import('./screens/docs/components-page/components-page.component').then(
      //       (m) => m.ComponentsPageComponent,
      //     ),
      // },
      // {
      //   path: 'blank',
      //   loadComponent: () =>
      //     import('./screens/blank/blank.component').then((m) => m.BlankComponent),
      // },
    ],
  },

  // Default redirect
  { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/app/404' },
];
