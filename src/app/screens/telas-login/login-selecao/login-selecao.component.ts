import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../../../core/auth/empresa.service';
import { ProvedorInfo } from '../../../types/empresa.types';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login-selecao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'login-selecao.component.html',
})
export class LoginSelecaoComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  public empresaService = inject(EmpresaService);

  username = '';
  loading = false;
  errorMessage = '';

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
    if (!this.username) {
      this.errorMessage = 'Por favor, insira o CPF/CNPJ.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.provedores.set([]);

    const cpf = this.username.replace(/\D/g, '');
    const apiUrl = this.empresaService.apiUrl;

    this.http.get<any>(`${apiUrl}app/auth/provedores/${cpf}?agrupado=true`).subscribe({
      next: (res) => {
        this.loading = false;
        const lista: ProvedorInfo[] = res?.provedores || res?.Provedores || [];

        if (lista.length === 0) {
          this.errorMessage = 'Nenhuma empresa encontrada para este CPF/CNPJ.';
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
        this.loading = false;
        console.error('[LoginSelecao] Erro ao buscar provedores:', err);
        this.errorMessage = 'Erro ao buscar empresas. Tente novamente.';
      },
    });
  }

  // Seleciona uma empresa da lista e navega para o login contextualizado
  selecionarProvedor(provedor: ProvedorInfo): void {
    // Passamos o provedor inteiro (incluindo cnpjEmpresa, telefoneEmpresa, email, etc.)
    // para não perdermos os dados que acabamos de receber da API.
    this.empresaService.setEmpresaManual({
      ...provedor,
      usernameCliente: this.username, // Salva temporariamente o CPF usado para buscar
    });

    // Cor da empresa antes de mudar para login
    if (provedor.cor) {
      this.themeService.applyCorEmpresa(provedor.cor);
    }

    this.router.navigate(['/login'], {
      queryParams: { cpf: this.username },
    });
  }
}
