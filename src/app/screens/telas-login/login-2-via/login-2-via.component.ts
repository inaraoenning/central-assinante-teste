import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../environments/environment';
// import { Observable } from 'rxjs';
import { EmpresaService } from '../../../core/auth/empresa.service';
import { FinanceiroService } from '../../financeiro/financeiro.service'; // Utiliza Service de Financeiro para carregar dados
import { Fatura2ViaComponent } from './fatura-2-via/fatura-2-via.component';

@Component({
  selector: 'app-login-2-via',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Fatura2ViaComponent],
  templateUrl: './login-2-via.component.html',
})
export class Login2ViaComponent {
  cpfcnpj = signal<string>('');
  telefoneRecebido = '46999838005';
  telefoneInserido = signal<string>('');
  mostrarTelefone = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  mostrarFaturas = signal<boolean>(false);

  router = inject(Router);
  route = inject(ActivatedRoute);
  logoEmpresa = this.route.snapshot.paramMap.get('logoEmpresa');
  nomeEmpresa = this.route.snapshot.paramMap.get('nomeEmpresa');

  public financeiroService = inject(FinanceiroService);
  public empresaService = inject(EmpresaService);

  Acessar() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
    this.mostrarTelefone.set(true);

    // Simulando chamada ao service de financeiro com dados mockados
    // para visualização da tela de faturas sem depender do endpoint de login-2-via
  }

  verificarCliente() {
    this.loading.set(true);

    const ultimosDigitos = this.telefoneInserido().slice(-4);
    const ultimosDigitosCliente = this.telefoneRecebido.slice(-4);

    console.log(ultimosDigitosCliente);
    if (ultimosDigitos === '8005') {
      this.mostrarFaturas.set(true);
      this.loading.set(false);
      this.mostrarTelefone.set(false);

      return;
    }

    this.loading.set(false);
    this.errorMessage.set('Telefone incorreto');
  }

  novaBusca() {
    return;
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}
