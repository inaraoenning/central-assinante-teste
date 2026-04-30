import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmpresaService } from '../../../core/services/empresa.service';
import { FaturaSegundaViaComponent } from './fatura-segunda-via/fatura-segunda-via.component';
import { NgxMaskDirective } from 'ngx-mask';
import { LoginSegundaViaService } from './login-segunda-via.service';
import { FaturaSegundaViaService } from './fatura-segunda-via/fatura-segunda-via.service';

@Component({
  selector: 'app-login-segunda-via',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FaturaSegundaViaComponent, NgxMaskDirective],
  templateUrl: './login-segunda-via.component.html',
})
export class LoginSegundaViaComponent {
  readonly loginSegundaViaService = inject(LoginSegundaViaService);
  readonly faturaSegundaViaService = inject(FaturaSegundaViaService);

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  cpfcnpj = signal<string>('');

  telefoneInserido = signal<string>('');
  mostrarTelefone = signal<boolean>(false);
  mostrarFaturas = signal<boolean>(false);

  router = inject(Router);
  route = inject(ActivatedRoute);

  public empresaService = inject(EmpresaService);

  Acessar() {
    this.loading.set(true);
    this.mostrarTelefone.set(true);
    this.loading.set(false);
  }

  verificarCliente() {
    const celular = this.telefoneInserido().replace(/\D/g, '').trim().slice(-4);
    const cpfCnpj = this.cpfcnpj().replace(/\D/g, '').trim();

    const foneCadastrado = this.loginSegundaViaService
      .cadastros()
      .find(
        (f) => f.telefoneMascarado?.replace(/\D/g, '').trim().slice(-4) == this.telefoneInserido(),
      );

    this.loading.set(true);

    if (!celular || celular.length < 4) {
      this.loading.set(false);
      this.errorMessage.set('Digite os últimos 4 dígitos do telefone');
      return;
    }

    if (isNaN(Number(celular))) {
      this.loading.set(false);
      this.errorMessage.set('Digite apenas números');
      return;
    }

    if (this.cpfcnpj() && !foneCadastrado) {
      this.errorMessage.set('Telefone não confere com o cadastrado');
    }

    this.loginSegundaViaService.buscarCliente(cpfCnpj, celular).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarFaturas.set(true);
          this.faturaSegundaViaService.buscarContratosSegundaVia();
        } else {
          this.errorMessage.set('Credenciais não conferem');
          this.loading.set(false);
        }
      },
      error: (error) => {
        this.errorMessage.set(error.error || 'Erro ao buscar cliente');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  novaBusca() {
    return;
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}
