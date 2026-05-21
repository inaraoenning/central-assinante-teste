import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propaganda } from '../../models/propaganda.model';
import { EmpresaService } from '../../core/services/empresa.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropagandaService {
  private http = inject(HttpClient);
  private empresa = inject(EmpresaService);
  private apiUrl = environment.apiUrl;

  getAds(): Observable<Propaganda[]> {
    const emp = this.empresa.empresaAtiva()?.dominio;

    if (!emp) return of([]);

    const url = `${this.apiUrl}propaganda/${emp}/`;

    return this.http.get<{ success: boolean; data: Propaganda[] }>(url).pipe(
      map((response) => response.data || []),
      map((ads) => {
        const agora = new Date();
        return ads.filter((ad) => {
          if (!ad.ativo) return false;
          const inicio = ad.dataInicio ? new Date(ad.dataInicio) : null;
          const fim = ad.dataFim ? new Date(ad.dataFim) : null;
          if (inicio && agora < inicio) return false;
          if (fim && agora > fim) return false;
          return true;
        });
      }),
    );
  }
}
