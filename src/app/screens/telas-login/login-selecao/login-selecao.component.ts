import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ProvedorInfo } from '../../../types/empresa.types';
import { ThemeService } from '../../../core/services/theme.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-login-selecao',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: 'login-selecao.component.html',
})
export class LoginSelecaoComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  public empresaService = inject(EmpresaService);

  username = signal('');
  loading = signal(false);
  errorMessage = signal('');

  themeService = inject(ThemeService);

  // Lista de provedores retornada pela API
  provedores = signal<ProvedorInfo[]>([]);
  // Nome do cliente retornado (exibido acima da lista)
  nomeCliente = signal<string>('');

  ngOnInit() {
    // Se já tem empresa identificada (veio do domínio), volta para /login
    if (this.empresaService.modo() === 'dominio') {
      this.router.navigate(['/login']);
    }
  }

  // Busca os provedores vinculados ao CPF/CNPJ informado
  onSubmit(): void {
    if (!this.username()) {
      this.errorMessage.set('Por favor, insira o CPF/CNPJ.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.provedores.set([]);

    const cpf = this.username().replace(/\D/g, '');
    const apiUrl = this.empresaService.apiUrl;

    this.http.get<any>(`${apiUrl}app/auth/provedores/${cpf}?agrupado=true`).subscribe({
      next: (res) => {
        this.loading.set(false);
        const lista: ProvedorInfo[] = res?.provedores || res?.Provedores || [];

        if (lista.length === 0) {
          this.errorMessage.set('Nenhuma empresa encontrada para este CPF/CNPJ.');
          return;
        }

        // Agrupa por domínio no front-end, pois a mesma empresa pode ter
        // idEmpresa diferentes no banco (registros distintos para o mesmo provedor).
        // Priorizamos o item com idMatriz preenchido, pois o login com idMatriz
        // gera um token que cobre todos os contratos da empresa (matriz + filiais).
        const porDominio = new Map<string, ProvedorInfo>();
        for (const p of lista) {
          const chave = p.dominio || p.nomeAmigavelEmpresa || String(p.idEmpresa);
          const existente = porDominio.get(chave);
          // Substitui se o novo item tiver idMatriz e o atual não tiver
          if (!existente || (!existente.idMatriz && p.idMatriz)) {
            porDominio.set(chave, p);
          }
        }
        const agrupados = Array.from(porDominio.values());

        if (agrupados.length === 1) {
          this.selecionarProvedor(agrupados[0]);
        } else {
          this.nomeCliente.set(agrupados[0].nomeAmigavelEmpresa || '');
          this.provedores.set(agrupados);
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('[LoginSelecao] Erro ao buscar provedores:', err);
        this.errorMessage.set('Erro ao buscar empresas. Tente novamente.');
      },
    });
  }

  // Seleciona uma empresa da lista e navega para o login contextualizado
  selecionarProvedor(provedor: ProvedorInfo): void {
    // Passamos o provedor inteiro (incluindo cnpjEmpresa, telefoneEmpresa, email, etc.)
    // para não perdermos os dados que acabamos de receber da API.
    this.empresaService.setEmpresaManual({
      ...provedor,
      usernameCliente: this.username(), // Salva temporariamente o CPF usado para buscar
    });

    this.router.navigate(['/login'], {
      queryParams: { cpf: this.username() },
    });
  }
}
