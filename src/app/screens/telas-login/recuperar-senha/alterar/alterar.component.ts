import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { RecuperarService } from '../recuperar/recuperar.service';

@Component({
  selector: 'app-alterar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'alterar.component.html',
})
export class AlterarComponent implements OnInit {
  private recuperarService = inject(RecuperarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  verificando = true;
  enableAlterar = false;
  success = false;
  errorMessage = '';
  successMessage = '';

  senha = '';
  repetirSenha = '';

  ngOnInit() {
    const hash = this.route.snapshot.params['hash'];

    if (!hash) {
      this.verificando = false;
      this.errorMessage = 'Link inválido. Solicite um novo link de redefinição.';
      return;
    }

    // Valida o hash via POST /app/auth/verificar-hash
    this.recuperarService.verificaHash({ token: hash }).subscribe({
      next: (res) => {
        this.verificando = false;
        if (res?.success !== false) {
          this.recuperarService.clienteState.update((s) => ({ ...s, token: hash }));
          this.enableAlterar = true;
        } else {
          this.errorMessage = res?.message || res?.error || 'Link inválido ou expirado.';
        }
      },
      error: () => {
        this.verificando = false;
        this.errorMessage = 'Link inválido ou expirado.';
      },
    });
  }

  salvarSenha(): void {
    this.errorMessage = '';

    if (!this.senha || !this.repetirSenha) {
      this.errorMessage = 'Informe a nova senha e a confirmação.';
      return;
    }
    if (this.senha !== this.repetirSenha) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    if (this.senha.length < 4) {
      this.errorMessage = 'A senha deve ter pelo menos 4 caracteres.';
      return;
    }

    this.loading = true;

    const payload = {
      ...this.recuperarService.clienteState(),
      senha: this.senha,
      repetirSenha: this.repetirSenha,
    };

    // POST /app/auth/alterar-senha
    this.recuperarService.alteraSenha(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.enableAlterar = false;
        if (res?.success !== false) {
          this.success = true;
          this.successMessage = 'Senha alterada com sucesso! Você já pode fazer login.';
        } else {
          this.errorMessage = res?.message || res?.error || 'Não foi possível alterar a senha.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Erro de conexão. Tente novamente.';
      },
    });
  }
}
