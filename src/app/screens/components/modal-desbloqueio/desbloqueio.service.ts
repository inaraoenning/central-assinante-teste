import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaService } from '../../../core/auth/empresa.service';
import {
  DesbloqueioTemporarioRequest,
  DesbloqueioTemporarioResponse,
} from '../../../types/desbloqueio.types';

@Injectable({
  providedIn: 'root',
})
export class DesbloqueioService {
  private http = inject(HttpClient);
  private empresaService = inject(EmpresaService);

  desbloqueioTemporario(
    payload: DesbloqueioTemporarioRequest,
  ): Observable<DesbloqueioTemporarioResponse> {
    const url = `${this.empresaService.apiUrl}app/financeiro/DesbloqueioTemporarioApp`;
    return this.http.post<DesbloqueioTemporarioResponse>(url, payload);
  }
}
