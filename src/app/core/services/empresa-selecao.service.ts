// Só cuida de quando o usuário digita o CPF, escolhe a empresa na lista (setEmpresaManual) e busca os dados no endpoint de provedores.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProvedorInfo } from '../../types/empresa.types';
import { EmpresaStateService } from './empresa-state.service';
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmpresaSelecaoService {
  private http = inject(HttpClient);
  private state = inject(EmpresaStateService);

  public apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl : environment.apiUrl + '/';

  // Selecionar a empresa (se tiver + 1 provedor)
  setEmpresaManual(empresa: ProvedorInfo) {
    this.state.atualizarEstado('selecao', empresa);
  }

  // Reseta para Central do Assinante (Trocar Provedor)
  resetarParaCentral() {
    this.state.limparStorage(); // Remove do Cache

    const empresaNeutra: ProvedorInfo = {
      dominio: window.location.hostname,
      nomeAmigavelEmpresa: 'Central do Assinante',
      logoUrl: 'assets/img/logo/logo.png',
      db: '',
      cnpjEmpresa: '',
      suporteEmpresa: '',
      telefoneEmpresa: '',
      emailEmpresa: '',
      cidadeEmpresa: '',
      ufEmpresa: '',
      enderecoEmpresa: '',
      bairroEmpresa: '',
      cepEmpresa: '',
    };

    // Atualiza o estado com a empresa neutra (isso reseta cor, titulo e favicon)
    this.state.atualizarEstado('selecao', empresaNeutra);
  }

  buscarDadosNaApi(empresa: ProvedorInfo) {
    // Só busca se tiver o CPF/CNPJ salvo na empresa
    if (!empresa.idEmpresa || !empresa.usernameCliente) return;

    // Limpa a formatação do CPF/CNPJ para a URL
    const documentoLimpo = empresa.usernameCliente.replace(/\D/g, '');
    const fullUrl = `${this.apiUrl}app/auth/provedores/${documentoLimpo}`;

    this.http
      .get<any>(fullUrl)
      .pipe(
        retry(1),
        catchError((err) => {
          console.warn('[EmpresaSelecaoService] Erro ao buscar dados:', err);
          return of({ success: false });
        }),
      )
      .subscribe((res) => {
        const dados = res.success !== undefined ? res.data : res;

        // Essa API retorna uma lista (array) de provedores daquele CPF
        const listaProvedores: any[] = res?.provedores || res?.Provedores || [];

        // Precisamos achar na lista o provedor que o usuário tinha escolhido antes
        const provedor = listaProvedores.find((p) => p.idEmpresa === empresa.idEmpresa) || dados;

        if (provedor && provedor.nomeAmigavelEmpresa) {
          const finalEmpresa = {
            ...empresa,
            ...provedor,
          };

          // Atualizamos o estado novamente com os dados frescos!
          this.state.atualizarEstado('selecao', finalEmpresa);
        }
      });
  }
}
