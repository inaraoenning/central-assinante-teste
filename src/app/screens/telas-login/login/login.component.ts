import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { EmpresaService } from '../../../core/services/empresa.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  public empresaService = inject(EmpresaService);

  loading = signal(false);
  errorMessage = signal('');

  private route = inject(ActivatedRoute);
  public cpfCnpj = this.route.snapshot.queryParams['cpf'];

  username = this.cpfCnpj ? this.cpfCnpj : '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Token na URL = direct login (link do provedor), tem prioridade total
    const token = this.route.snapshot.queryParams['token'];

    // Se não temos empresa identificada (idEmpresa) e não estamos no modo domínio,
    // então precisamos ir para a tela de seleção por CPF/CNPJ.
    const empresa = this.empresaService.empresaAtiva();
    if (!empresa?.idEmpresa && this.empresaService.modo() !== 'dominio') {
      this.router.navigate(['/login-selecao']);
    }
  }

  get modoDominio(): boolean {
    return this.empresaService.modo() === 'dominio';
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor, insira o CPF/CNPJ e a senha.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!res.success) this.errorMessage.set(res.error || 'Credenciais inválidas.');
      },
      error: (err) => {
        // O erro pode vir do front (via throwError da service) ou da requisição bloqueada
        this.errorMessage.set(err.message || 'Erro de conexão com o servidor.');
        this.loading.set(false);
      },
    });
  }

  irPara2ViaBoleto(): void {
    this.router.navigate(['/login-segunda-via']);
  }
}
