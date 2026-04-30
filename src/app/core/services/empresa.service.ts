// Distribui as tarefas entre os 3 services de empresa e expõe os Signals
import { Injectable, inject } from '@angular/core';
import { EmpresaStateService } from './empresa-state.service';
import { EmpresaDominioService } from './empresa-dominio.service';
import { EmpresaSelecaoService } from './empresa-selecao.service';
import { ProvedorInfo } from '../../types/empresa.types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private state = inject(EmpresaStateService);
  private dominioService = inject(EmpresaDominioService);
  private selecaoService = inject(EmpresaSelecaoService);

  // Expõe os Signals para os outros componentes
  public modo = this.state.modo;
  public empresaAtiva = this.state.empresaAtiva;

  constructor() {
    this.iniciar();
  }

  // Lê a URL, descobre provedor através do switch e busca os dados da empresa através do dominio.
  public apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl : environment.apiUrl + '/';

  // Boot da Aplicação
  private iniciar() {
    const salvo = localStorage.getItem('provedor_empresa_cache');

    if (salvo) {
      const parsed = JSON.parse(salvo) as ProvedorInfo;
      const modoCache = parsed.idEmpresa ? 'selecao' : 'dominio';

      this.state.atualizarEstado(modoCache, parsed);

      if (modoCache === 'selecao') {
        this.selecaoService.buscarDadosNaApi(parsed);
      } else {
        // Se for domínio, chama iniciarPorDominio que faz o get
        this.dominioService.iniciarPorDominio();
      }
    } else {
      // Se não tem cache, aciona por dominio
      this.dominioService.iniciarPorDominio();
    }
  }

  // Métodos que apenas chamam o serviço certo
  setEmpresaManual(empresa: ProvedorInfo) {
    this.selecaoService.setEmpresaManual(empresa);
  }

  salvarNoStorage() {
    this.state.salvarNoStorage();
  }

  limparStorage() {
    this.state.limparStorage();
  }

  resetarParaGenerico() {
    this.selecaoService.resetarParaCentral();
  }
}
