// Lê a URL, descobre provedor através do switch e busca os dados da empresa através do dominio.
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
export class EmpresaDominioService {
  private http = inject(HttpClient);
  private state = inject(EmpresaStateService);

  public apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl : environment.apiUrl + '/';

  iniciarPorDominio() {
    const hostname = window.location.hostname;
    const dominioDetectado = hostname.startsWith('www.') ? hostname.substring(4) : hostname;

    let isDominioValido = false;

    const empresaBase: ProvedorInfo = {
      dominio: dominioDetectado,
      logoUrl: `assets/img/logo_${dominioDetectado}.png`,
      nomeAmigavelEmpresa: 'Central do Assinante',
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
      cor: '',
    };

    switch (hostname) {
      case 'lifenet.com.br':
        empresaBase.dominio = 'lifenet.com.br';
        empresaBase.db = 'v2';
        isDominioValido = true;
        break;
      // ... COPIE E COLE TODOS OS OUTROS CASES AQUI ...
      case 'jatointernet.com.br':
        empresaBase.dominio = 'jatointernet.com.br';
        empresaBase.db = 'v2';
        isDominioValido = true;
        break;
      case 'beltraonet.com.br':
        empresaBase.dominio = 'beltraonet.com.br';
        empresaBase.db = 'v2';
        isDominioValido = true;
        break;

      case 'rpmtelecom.com.br':
        empresaBase.dominio = 'rpmtelecom.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      case 'gwinternet.com.br':
        empresaBase.dominio = 'gwinternet.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      case 'viarapidanet.com.br':
        empresaBase.dominio = 'viarapidanet.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      case 'ultramega.net.br':
        empresaBase.dominio = 'ultramega.net.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;
      case 'dwlink.com.br':
        empresaBase.dominio = 'dwlink.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      case 'megaprovedor.net.br':
        empresaBase.dominio = 'megaprovedor.net.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      case 'netplusinternet.com.br':
        empresaBase.dominio = 'netplusinternet.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      case 'giatechnet.com.br':
        empresaBase.dominio = 'giatechnet.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      case 'comfibranet.com.br':
        empresaBase.dominio = 'comfibranet.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;
      case 'comfibra.com.br':
        empresaBase.dominio = 'comfibra.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;
      case 'wiip.com.br':
        empresaBase.dominio = 'wiip.com.br';
        empresaBase.db = 'v1';
        isDominioValido = true;
        break;

      default:
        // Para testes locais: simula o modo domínio de uma empresa real.
        // REMOVER antes de ir para produção — deixar o default sem _modo.set para forçar /login-selecao.
        //isDominioValido = true;
        //empresaBase.dominio = 'lifenet.com.br'; // ← domínio primeiro
        //empresaBase.logoUrl = `assets/img/logo_${empresaBase.dominio}.png`; // ← logo depois
        //empresaBase.db = 'v2';

        break;
    }

    if (isDominioValido) {
      // Se for um site de provedor, age como domínio
      this.buscarDadosNaApi(empresaBase);
      this.state.atualizarEstado('dominio', empresaBase);
    } else {
      // Se for localhost (ou outro não cadastrado), age como portal genérico de seleção!
      this.state.atualizarEstado('selecao', empresaBase);
    }
  }

  private buscarDadosNaApi(empresaBase: ProvedorInfo) {
    const fullUrl = `${this.apiUrl}app/empresa/${empresaBase.dominio}`;

    this.http
      .get<any>(fullUrl)
      .pipe(
        retry(1),
        catchError((err) => {
          console.warn('[EmpresaDominioService] Erro ao buscar metadados pelo domínio:', err);
          return of({ success: false });
        }),
      )
      .subscribe((res) => {
        const dados = res.success !== undefined ? res.data : res;

        if (dados && dados.nomeAmigavelEmpresa) {
          // Junta o que descobrimos na URL com o que veio do Banco de Dados
          const finalEmpresa = {
            ...empresaBase,
            ...dados,
          };

          // Atualiza o estado de novo (Cores aqui)
          this.state.atualizarEstado('dominio', finalEmpresa);
        }
      });
  }
}
