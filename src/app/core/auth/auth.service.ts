// Login, dados do cliente e validar senha

import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { EmpresaService } from './empresa.service';
import { AppLoginResponse } from '../../types/empresa.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private empresaService = inject(EmpresaService);

  private readonly TOKEN_KEY = 'TOKEN';
  private readonly CLIENTE_KEY = 'CLIENTE';

  // Private para não sofrer alterações com set de fora
  private usuarioLogadoSignal = signal<any | null>(this.getStoredCliente());
  private clienteAtualSignal = signal<boolean>(this.checkInitialAuth());

  // Expondo sinais publicos somente para leitura
  readonly usuarioAtual = computed(() => this.usuarioLogadoSignal());
  readonly estaLogado = computed(() => this.clienteAtualSignal());

  /**
   * Ponto de entrada unificado para login.
   * Lida automaticamente com a descoberta de ID de empresa se o sistema
   * operado sob modo `dominio` ainda não souber o idEmpresa ou DB.
   */
  login(model: { username: string; password?: string }): Observable<AppLoginResponse> {
    const cleanUsername = model.username.replace(/\D/g, '');
    const empresa = this.empresaService.empresaAtiva();

    // Lógica movida do component para descoberta dinâmica via CpfCnpj
    if (this.empresaService.modo() === 'dominio' && !empresa?.idEmpresa) {
      const apiUrl = this.empresaService.apiUrl;
      return this.http.get<any>(`${apiUrl}app/auth/provedores/${cleanUsername}`).pipe(
        switchMap((res) => {
          const lista = res?.provedores || res?.Provedores || [];
          if (lista.length === 0) {
            return throwError(() => new Error('Nenhuma conta encontrada para este CPF/CNPJ.'));
          }

          // Tenta encontrar na lista a empresa que tenha o mesmo domínio acessando
          const provedorEncontrado = lista.find((p: any) => p.dominio === empresa?.dominio);

          if (!provedorEncontrado) {
            return throwError(
              () => new Error('Este CPF/CNPJ não possui contrato vinculado a este provedor.'),
            );
          }

          this.empresaService.setEmpresaManual({
            ...empresa!,
            idEmpresa: provedorEncontrado.idEmpresa,
            db: provedorEncontrado.db,
            nomeAmigavelEmpresa: provedorEncontrado.nomeAmigavelEmpresa,
            telefoneEmpresa: provedorEncontrado.telefoneEmpresa,
            suporteEmpresa: provedorEncontrado.suporteEmpresa,
            emailEmpresa: provedorEncontrado.emailEmpresa,
            cnpjEmpresa: provedorEncontrado.cnpjEmpresa,
            logoUrl: provedorEncontrado.logoUrl,
          });

          return this.validateCredentials({
            username: cleanUsername,
            password: model.password,
            dominio: provedorEncontrado.dominio || empresa?.dominio,
          });
        }),
      );
    }

    // Se já tiver empresa identificada, vai direto para requisitar Token
    return this.validateCredentials({
      username: cleanUsername,
      password: model.password,
      dominio: empresa?.dominio || window.location.hostname,
    });
  }

  /**
   * Disparo final do POST de login no back-end.
   */
  validateCredentials(model: {
    username: string;
    password?: string;
    dominio?: string;
  }): Observable<AppLoginResponse> {
    const empresa = this.empresaService.empresaAtiva();

    const payload = {
      CpfCnpj: model.username,
      Password: model.password,
      IdEmpresa: empresa?.idEmpresa || 0,
      Db: empresa?.db || 'v1',
    };

    return this.http
      .post<AppLoginResponse>(`${this.empresaService.apiUrl}app/auth/login`, payload)
      .pipe(
        tap((response) => {
          if (response.success && response.token) {
            const clienteNormalizado = {
              ...response.cliente,
              codigo: response.cliente?.idCliente,
              cpf_cnpj: response.cliente?.cpfCnpj,
            };
            this.logIn(response.token, clienteNormalizado, 0);
          }
        }),
      );
  }

  //Login direto via token (link externo do provedor).
  //Endpoint: POST /app/auth/external-login
  directLogin(model: { username: string; token?: string }): Observable<AppLoginResponse> {
    return this.http
      .post<AppLoginResponse>(`${this.empresaService.apiUrl}app/auth/external-login`, {
        CpfCnpj: model.username,
        Token: model.token,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.token) {
            const clienteNormalizado = {
              ...response.cliente,
              codigo: response.cliente?.idCliente,
              cpf_cnpj: response.cliente?.cpfCnpj,
            };
            this.logIn(response.token, clienteNormalizado, 0);
          }
        }),
      );
  }

  logIn(token: string, cliente: any, tokenTimeOut: number, returnUrl?: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);

    const t = new Date();
    t.setSeconds(t.getSeconds() + (tokenTimeOut || 0));
    sessionStorage.setItem('TOKEN_EXPIRES', t.toString());

    if (cliente) {
      sessionStorage.setItem(this.CLIENTE_KEY, JSON.stringify(cliente));
      this.usuarioLogadoSignal.set(cliente);
    }

    // Só consolida a empresa localmente quando tiver certeza que autenticou
    this.empresaService.salvarNoStorage();
    this.clienteAtualSignal.set(true);

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  logout(): void {
    const modo = this.empresaService.modo();
    sessionStorage.clear();
    localStorage.removeItem('@App:clienteInfo'); // Limpa cache do cliente anterior
    this.empresaService.limparStorage(); // Remove empresa cacheada
    this.empresaService.resetarParaGenerico(); // Limpa cor da empresa
    this.usuarioLogadoSignal.set(null);
    this.clienteAtualSignal.set(false);
    this.router.navigate(['/login-selecao']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  private checkInitialAuth(): boolean {
    return !!sessionStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredCliente(): any | null {
    const data = sessionStorage.getItem(this.CLIENTE_KEY);
    return data ? JSON.parse(data) : null;
  }
}
