// Descobrir empresa
import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { retry, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProvedorInfo } from '../../types/empresa.types';
import { ThemeService } from '../services/theme.service';

const STORAGE_KEY = 'provedor_empresa_cache';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private http = inject(HttpClient);
  private tituloService = inject(Title); // Subsitui o document.title
  private themeService = inject(ThemeService);

  /*
    Define o título da aba do navegador dinamicamente
    document.title = (empresa.nomeAmigavelEmpresa || 'Central do Assinante') + ' :: Central do Assinante';
  */

  // 1. URL base tratada
  public apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl : environment.apiUrl + '/';

  // 2. Sinais Privados
  private _modo = signal<'dominio' | 'selecao' | null>(null);
  private _empresaAtiva = signal<ProvedorInfo | null>(null);

  // 3. Sinais Públicos
  public modo = computed(() => this._modo());
  public empresaAtiva = computed(() => this._empresaAtiva());

  constructor() {
    this.resolverConfiguracaoInicial();
    this.carregarDadosDaEmpresa();
  }

  private resolverConfiguracaoInicial() {
    // Verifica localStorage primeiro
    const salvo = localStorage.getItem(STORAGE_KEY);

    if (salvo) {
      const parsed = JSON.parse(salvo);
      this._empresaAtiva.set(parsed);
      this._modo.set(parsed.idEmpresa ? 'selecao' : 'dominio');
      this.atualizarTitulo(parsed.nomeAmigavelEmpresa);

      // Quando recarregar o site, precisamos puxar a cor guardada do provedor no local storage
      if (parsed.cor) {
        this.themeService.applyCorEmpresa(parsed.cor);
      }

      // Favicon: modo domínio usa o site da empresa, seleção usa o local
      const modoCache = parsed.idEmpresa ? 'selecao' : 'dominio';
      if (modoCache === 'dominio' && parsed.dominio) {
        this.atualizarFavicon(`https://www.${parsed.dominio}/favicon.ico`);
      } else {
        this.atualizarFavicon();
      }

      return;
    }

    // se não tem cache, analisa URL (antigo config.ts)
    const hostname = window.location.hostname;
    const dominioDetectado = hostname.startsWith('www.') ? hostname.substring(4) : hostname;

    const empresaBase: ProvedorInfo = {
      dominio: dominioDetectado,
      logoUrl: `assets/img/logo_${dominioDetectado}.png`,
      nomeAmigavelEmpresa: 'Central do Assinante',
      db: '',
      cnpjEmpresa: '',
      suporteEmpresa: '',
      telefoneEmpresa: '',
      emailEmpresa: '',
    };

    switch (hostname) {
      case 'lifenet.com.br':
        empresaBase.dominio = 'lifenet.com.br';
        empresaBase.db = 'v2';
        this._modo.set('dominio');
        break;

      case 'jatointernet.com.br':
        empresaBase.dominio = 'jatointernet.com.br';
        empresaBase.db = 'v2';
        this._modo.set('dominio');
        break;

      case 'beltraonet.com.br':
        empresaBase.dominio = 'beltraonet.com.br';
        empresaBase.db = 'v2';
        this._modo.set('dominio');
        break;

      case 'rpmtelecom.com.br':
        empresaBase.dominio = 'rpmtelecom.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      case 'gwinternet.com.br':
        empresaBase.dominio = 'gwinternet.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      case 'viarapidanet.com.br':
        empresaBase.dominio = 'viarapidanet.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      case 'ultramega.net.br':
        empresaBase.dominio = 'ultramega.net.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;
      case 'dwlink.com.br':
        empresaBase.dominio = 'dwlink.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      case 'megaprovedor.net.br':
        empresaBase.dominio = 'megaprovedor.net.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      case 'netplusinternet.com.br':
        empresaBase.dominio = 'netplusinternet.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      case 'giatechnet.com.br':
        empresaBase.dominio = 'giatechnet.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      case 'comfibranet.com.br':
        empresaBase.dominio = 'comfibranet.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;
      case 'comfibra.com.br':
        empresaBase.dominio = 'comfibra.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;
      case 'wiip.com.br':
        empresaBase.dominio = 'wiip.com.br';
        empresaBase.db = 'v1';
        this._modo.set('dominio');
        break;

      default:
        // Para testes locais: simula o modo domínio de uma empresa real.
        // REMOVER antes de ir para produção — deixar o default sem _modo.set para forçar /login-selecao.

        //empresaBase.dominio = 'beltraonet.com.br'; // ← domínio primeiro
        //empresaBase.logoUrl = `assets/img/logo_${empresaBase.dominio}.png`; // ← logo depois
        //empresaBase.db = 'v2';
        //this._modo.set('dominio');
        break;
    }

    // Após o switch, persiste o empresaBase montado no signal _empresaAtiva
    // (somente se não carregou do localStorage — evita sobrescrever cache válido)
    if (!localStorage.getItem(STORAGE_KEY)) {
      this._empresaAtiva.set(empresaBase);
    }
  }

  // Chamado quando usuário escolhe empresa no login-selecao
  setEmpresaManual(empresa: ProvedorInfo) {
    this._empresaAtiva.set(empresa);
    this._modo.set('selecao');
    // REMOVIDO: Não salva no LocalStorage aqui. Fica só na memória (RAM) até autenticar!
  }

  // Salvar apenas no pós-login
  salvarNoStorage() {
    const emp = this.empresaAtiva();
    if (emp) localStorage.setItem(STORAGE_KEY, JSON.stringify(emp));
  }

  // Limpar apenas no logout
  limparStorage() {
    localStorage.removeItem(STORAGE_KEY);
    this._empresaAtiva.set(null);
  }

  // Transforma o portal em uma Central neutra quando o usuário desiste do domínio e quer escolher o provedor por CPF
  resetarParaGenerico() {
    this.limparStorage();

    // Injeta visual padrão do provedor atual
    const empresaNeutra: ProvedorInfo = {
      dominio: window.location.hostname,
      logoUrl: '',
      nomeAmigavelEmpresa: 'Central do Assinante',
      db: '',
      cnpjEmpresa: '',
      suporteEmpresa: '',
      telefoneEmpresa: '',
      emailEmpresa: '',
      cor: '',
    };

    this._empresaAtiva.set(empresaNeutra);
    this._modo.set('selecao');
    this.atualizarTitulo('Central do Assinante');
    this.themeService.resetCorEmpresa();
    this.atualizarFavicon(); // Sem parâmetro → volta ao favicon.png padrão
  }

  private atualizarTitulo(nomeAmigavelEmpresa?: string) {
    const titulo = nomeAmigavelEmpresa
      ? `${nomeAmigavelEmpresa} :: Central do Assinante`
      : 'Central do Assinante';
    this.tituloService.setTitle(titulo);
  }

  private atualizarFavicon(faviconUrl?: string): void {
    // Remove o link antigo para forçar o browser a reprocessar o ícone
    const antigo = document.querySelector('link[rel="icon"]');
    if (antigo) antigo.remove();

    // Cria elemento novo — browser não tem cache desse elemento
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';

    if (faviconUrl) {
      // Cache-buster via timestamp garante que o browser não reutilize o ícone anterior
      link.href = `${faviconUrl}?t=${Date.now()}`;
      link.onerror = () => {
        link.href = 'favicon.ico';
      };
    } else {
      link.href = 'favicon.ico';
    }

    document.head.appendChild(link);
  }

  private carregarDadosDaEmpresa() {
    const empresa = this.empresaAtiva();
    if (!empresa) return;

    // Se estivermos no modo domínio, tentamos buscar dados na API legada (CentralAssinanteWebapi)
    // para preencher o nomeAmigavel e logoUrl antes do login.
    let fullUrl = '';

    if (this.modo() === 'dominio' && !empresa.idEmpresa) {
      // LOGIN DOMINIO - Busca dados da empresa baseado na NOVA API
      fullUrl = `${this.apiUrl}app/empresa/${empresa.dominio}`;
    } else if (empresa.idEmpresa && empresa.usernameCliente) {
      // LOGIN SELEÇÃO - Busca dados da empresa baseado no CPF/CNPJ inserido na seleção
      fullUrl = `${this.apiUrl}app/auth/provedores/${empresa.usernameCliente?.replace(/\D/g, '')}`;
    } else {
      return; // Sem dados suficientes para buscar
    }

    this.http
      .get<any>(fullUrl)
      .pipe(
        retry(1),
        catchError((err) => {
          console.warn('[EmpresaService] Erro ao buscar metadados:', err);
          return of({ success: false });
        }),
      )
      .subscribe((res) => {
        // Dados da API retorna dentro de { success, data }
        const dados = res.success !== undefined ? res.data : res;

        // Teste com CPF recebe array de 'provedores', precisamos achar o atual
        // Se apenas domínio, 'dados' é objeto limpo.
        const listaProvedores: any[] = res?.provedores || res?.Provedores || [];
        const provedor = listaProvedores.find((p) => p.idEmpresa === empresa.idEmpresa) || dados;

        if (provedor && (provedor.nomeAmigavelEmpresa || provedor.nomeAmigavel)) {
          const finalEmpresa = {
            ...empresa,
            ...provedor,
            nomeAmigavelEmpresa: provedor.nomeAmigavelEmpresa || provedor.nomeAmigavel,
            logoUrl: provedor.logoUrl || provedor.urlLogo || empresa.logoUrl,
            telefoneEmpresa:
              provedor.telefoneEmpresa || provedor.telefone || empresa.telefoneEmpresa,
            suporteEmpresa:
              provedor.suporteEmpresa ||
              provedor.telefone0800 ||
              provedor.suporte ||
              empresa.suporteEmpresa,
            emailEmpresa: provedor.emailEmpresa || provedor.email || empresa.emailEmpresa,
            cnpjEmpresa: provedor.cnpjEmpresa || provedor.cnpj || empresa.cnpjEmpresa,
            cidade: provedor.cidade || provedor.cidadeEmpresa || empresa.cidade,
            uf: provedor.uf || provedor.ufEmpresa || empresa.uf,
            bairro: provedor.bairro || provedor.bairroEmpresa || empresa.bairro,
            endereco: provedor.endereco || provedor.enderecoEmpresa || empresa.endereco,
            cor: provedor.cor || provedor.corPrimaria || empresa.cor,
          };

          this._empresaAtiva.set(finalEmpresa);

          if (finalEmpresa.cor) {
            this.themeService.applyCorEmpresa(finalEmpresa.cor);
          }

          // Favicon:
          // - Modo domínio: usa o favicon.ico do próprio site da empresa
          // - Modo seleção: usa o local de public/ até o domínio ser identificado
          if (this.modo() === 'dominio') {
            this.atualizarFavicon(`https://www.${finalEmpresa.dominio}/favicon.ico`);
          } else {
            this.atualizarFavicon();
          }

          if (finalEmpresa.nomeAmigavelEmpresa) {
            document.title = `${finalEmpresa.nomeAmigavelEmpresa} :: Central do Assinante`;
          }
        }
      });
  }
}
