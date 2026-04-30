import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { RecuperarService } from './recuperar.service';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar.component.html',
})
export class RecuperarComponent {
  private recuperarService = inject(RecuperarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = this.route.snapshot.queryParams['email'];
  cpfCnpj = '';
  loading = false;
  errorMessage = '';

  /**
   * Fluxo simplificado com novo endpoint:
   * POST /mail/SendRecuperarSenhaDynamic
   * O backend busca o email e envia o link de redefinição sozinho.
   */
  seguir(): void {
    this.loading = true;
    this.errorMessage = '';

    const cpfCnpj = this.cpfCnpj.replace(/\D/g, '');
    const empresa = this.recuperarService['empresaService'].empresaAtiva();

    // Descobrir o idCliente (código) e validar o email, igual ao ProvedorApp
    const apiUrl = this.recuperarService['empresaService'].apiUrl;
    this.recuperarService['http']
      .get<any>(`${apiUrl}app/auth/provedores/${cpfCnpj}?agrupado=true`)
      .subscribe({
        next: (res) => {
          const lista: any[] = res?.provedores || res?.Provedores || [];
          // Encontra a inscrição do cliente vinculada a esta empresa atual (ou a primeira, caso não haja empresa setada)
          const provedorEncontrado = empresa?.idEmpresa
            ? lista.find((p) => p.idEmpresa === empresa.idEmpresa)
            : lista[0];

          if (!provedorEncontrado) {
            this.loading = false;
            this.errorMessage = 'Cadastro não encontrado para este CPF/CNPJ nesta empresa.';
            return;
          }

          if (!provedorEncontrado.emailCliente) {
            this.loading = false;
            this.errorMessage = 'E-mail não cadastrado. Entre em contato com o suporte.';
            return;
          }

          // 2. Tendo o idCliente e o DB, fazemos a requisição igual ao ProvedorApp
          this.recuperarService
            .enviarRecuperacaoSenha({
              cpfCnpj,
              idCliente: provedorEncontrado.idCliente,
              db: provedorEncontrado.db,
            })
            .subscribe({
              next: (resEmail) => {
                this.loading = false;
                if (resEmail?.success === false) {
                  this.errorMessage =
                    resEmail?.error ||
                    resEmail?.mensagem ||
                    'Não foi possível processar. Tente novamente.';
                  return;
                }

                // Salva cpf e email para confirmação
                this.recuperarService.clienteState.set({
                  ...this.recuperarService.clienteState(),
                  cpfCnpj,
                  emailCliente: provedorEncontrado.emailCliente,
                } as any);
                this.router.navigate(['/forgot-password/confirmado']);
              },
              error: (errEmail) => {
                this.loading = false;
                console.error('[Recuperar] Erro na requisição de e-mail:', errEmail);
                this.errorMessage =
                  errEmail?.error?.mensagem ||
                  errEmail?.error?.error ||
                  'Erro ao comunicar com servidor.';
              },
            });
        },
        error: (err) => {
          this.loading = false;
          console.error('[Recuperar] Erro ao pesquisar provedor:', err);
          this.errorMessage =
            'Falha ao buscar dados do cliente. Verifique se o CPF/CNPJ está correto.';
        },
      });
  }
}
