import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { EmpresaService } from '../../../core/auth/empresa.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  public empresaService = inject(EmpresaService);
  public cpfCnpj = inject(ActivatedRoute).snapshot.queryParams['cpf'];

  loading = signal(false);
  errorMessage = signal('');

  username = this.cpfCnpj ? this.cpfCnpj : '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Token na URL = direct login (link do provedor), tem prioridade total
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.loading.set(true);
      const urlUsername = this.route.snapshot.queryParams['username'] || '';
      this.authService.directLogin({ username: urlUsername, token }).subscribe({
        next: (res) => {
          if (!res.success) this.errorMessage.set(res.error || 'Falha no login com token');
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Erro ao conectar no servidor.');
          this.loading.set(false);
        },
      });
      return;
    }

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
    this.router.navigate(['/login-via-boleto']);
  }
}
