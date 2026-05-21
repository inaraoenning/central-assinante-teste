import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProtocolosService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private cliente = inject(AuthService).usuarioAtual;

  // Retorna um único objeto ProtocolosClienteResponse (não array)
  buscarProtocolos(): Observable<ApiResponse<ProtocolosClienteResponse>> {
    return this.http.get<ApiResponse<ProtocolosClienteResponse>>(
      `${this.apiUrl}protocolos/${this.cliente()?.codigo}`,
    );
  }
}
