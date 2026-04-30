import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../../../core/services/empresa.service';
import { tap, finalize } from 'rxjs';

import {
  SegundaViaLoginRequest,
  SegundaViaLoginResponse,
  SegundaViaCadastroDto,
} from '../../../types/segunda-via-login.types';

@Injectable({
  providedIn: 'root',
})
export class LoginSegundaViaService {
  private readonly httpClient = inject(HttpClient);
  private readonly empresaService = inject(EmpresaService);

  private readonly _isLoading = signal<boolean>(false);
  private readonly _token2Via = signal<string | null>(null);
  private readonly _cadastros = signal<SegundaViaCadastroDto[]>([]);

  readonly isLoading = this._isLoading.asReadonly();
  readonly token2Via = this._token2Via.asReadonly();
  readonly cadastros = this._cadastros.asReadonly();

  buscarCliente(cpfCnpj: string, ultimos4Telefone: string) {
    this._isLoading.set(true);

    const empresa = this.empresaService.empresaAtiva();

    const request: SegundaViaLoginRequest = {
      cpfCnpj: cpfCnpj,
      ultimos4Telefone: ultimos4Telefone,
      db: empresa?.db || '',
      idEmpresa: empresa?.idEmpresa || 0,
    };

    const url = `${this.empresaService.apiUrl}app/auth/segunda-via/login`;

    return this.httpClient.post<SegundaViaLoginResponse>(url, request).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this._token2Via.set(response.token || null);
            this._cadastros.set(response.cadastros || []);
            console.log(response.cadastros);
          } else {
            console.error(response.error);
          }
        },
        error: (err) => {
          console.error('Erro ao fazer login 2ª Via', err);
        },
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }
}
