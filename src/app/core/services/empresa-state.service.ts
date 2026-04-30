// Guarda os Signals (empresaAtiva, modo), gerencia o LocalStorage, Tema, Favicon e Título.
import { computed, inject, Injectable, signal } from '@angular/core';
import { ProvedorInfo } from '../../types/empresa.types';
import { Title } from '@angular/platform-browser';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'provedor_empresa_cache';

@Injectable({
  providedIn: 'root',
})
export class EmpresaStateService {
  private tituloService = inject(Title); // Subsitui o document.title
  private themeService = inject(ThemeService);

  // Sinais Privados
  private _modo = signal<'dominio' | 'selecao' | null>(null);
  private _empresaAtiva = signal<ProvedorInfo | null>(null);

  // Sinais Públicos
  public modo = computed(() => this._modo());
  public empresaAtiva = computed(() => this._empresaAtiva());

  // Método central para outros serviços atualizar estado
  atualizarEstado(modo: 'dominio' | 'selecao', empresa: ProvedorInfo) {
    // Atualiza os dados (Signals)
    this._modo.set(modo);
    this._empresaAtiva.set(empresa);

    // Cor Empresa
    if (empresa.cor) {
      this.themeService.applyCorEmpresa(empresa.cor);
    }

    // Título
    this.atualizarTitulo(empresa.nomeAmigavelEmpresa);

    // Favicon (dominio usa url da empresa, selecao usa local)
    if (modo === 'dominio' && empresa.dominio) {
      this.atualizarFavicon('https://www.' + empresa.dominio + '/favicon.ico');
    } else {
      this.atualizarFavicon();
    }
  }

  // Limpar tela (logout ou trocar provedor)
  limparEstadoEVisual() {
    this._empresaAtiva.set(null);
    this.themeService.resetCorEmpresa();
    this.atualizarFavicon();
  }

  // Limpar no logout
  limparStorage() {
    localStorage.removeItem(STORAGE_KEY);
    this.limparEstadoEVisual();
  }

  // Salvar só depois do login
  salvarNoStorage() {
    const emp = this.empresaAtiva();
    if (emp) localStorage.setItem(STORAGE_KEY, JSON.stringify(emp));
  }

  private atualizarTitulo(nomeAmigavelEmpresa?: string) {
    const titulo = nomeAmigavelEmpresa
      ? `${nomeAmigavelEmpresa} :: Central do Assinante`
      : 'Central do Assinante';
    this.tituloService.setTitle(titulo);
  }

  private atualizarFavicon(faviconUrl?: string): void {
    // Remove o link antigo e força o novo favicon no navegador
    const antigo = document.querySelector('link[rel="icon"]');
    if (antigo) antigo.remove();

    // Cria novo elemento de icon, navegador não tem cache dele
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';

    if (faviconUrl) {
      // Cache-buster via timestamp, garante que o browser não reutilize o ícone anterior
      link.href = `${faviconUrl}?t=${Date.now()}`;
      link.onerror = () => {
        link.href = 'favicon.ico';
      };
    } else {
      link.href = 'favicon.ico';
    }

    document.head.appendChild(link);
  }
}
