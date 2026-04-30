import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmpresaService } from '../../../../core/services/empresa.service';
import { RecuperarRequest } from '../../../../types/empresa.types';

@Injectable({ providedIn: 'root' })
export class RecuperarService {
  public http = inject(HttpClient);
  public empresaService = inject(EmpresaService);

  // Estado compartilhado entre as etapas
  clienteState = signal<RecuperarRequest>({});

  private get api(): string {
    return this.empresaService.apiUrl;
  }

  // Recuperação de senha.
  // POST /mail/SendRecuperarSenhaDynamic
  // O backend busca o email do cliente e envia o link sozinho.
  // Payload: { db, codigo, cpfCnpj }

  enviarRecuperacaoSenha(cliente: RecuperarRequest): Observable<any> {
    const db = this.empresaService.empresaAtiva()?.db || cliente.db || 'v1';

    const body = {
      db,
      codigo: cliente.idCliente || 0,
      cpfCnpj: cliente.cpfCnpj || '',
    };

    return this.http.post(`${this.api}mail/SendRecuperarSenhaDynamic`, body);
  }

  /**
   * Valida hash do link de email antes de exibir form de nova senha.
   * Endpoint: POST /app/auth/verificar-hash
   */
  verificaHash(data: { token: string }): Observable<any> {
    return this.http.post(`${this.api}app/auth/verificar-hash`, data);
  }

  /**
   * Altera a senha usando o hash validado.
   * Endpoint: POST /app/auth/alterar-senha
   */
  alteraSenha(data: RecuperarRequest): Observable<any> {
    return this.http.post(`${this.api}app/auth/alterar-senha`, data);
  }

  /**
   * Busca o código do cliente pelo CPF/CNPJ.
   * Endpoint: GET /app/cliente/buscar/{cpfCnpj}
   */
  buscarClientePorCpf(cpfCnpj: string): Observable<any> {
    return this.http
      .get(`${this.api}app/cliente/buscar/${cpfCnpj}`)
      .pipe(map((res: any) => res?.data || res));
  }
}
