import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell da recuperação de senha — apenas renderiza o filho ativo via router-outlet.
 * As 3 etapas são rotas filhas: / → recuperar, /redefinir, /confirmado, /alterar/:hash
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class ForgotPasswordComponent {}
