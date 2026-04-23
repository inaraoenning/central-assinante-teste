import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propaganda } from '../../models/propaganda.model';
import { EmpresaService } from '../../core/auth/empresa.service';

@Injectable({ providedIn: 'root' })
export class PropagandaService {
  private empresa = inject(EmpresaService);

  constructor(private http: HttpClient) {}

  getAds(): Observable<Propaganda[]> {
    const emp = this.empresa.empresaAtiva()?.dominio;
    // O parâmetro `t` no final serve para enganar o navegador e contornar o cache do arquivo .json
    const configUrl = 'assets/propaganda/' + emp + '/propaganda.json?t=' + new Date().getTime();
    console.log('propaganda url gerada:', configUrl);

    return this.http.get<{ banners: Propaganda[] }>(configUrl).pipe(
      // Filtra apenas as que estão marcadas como ativas
      map((response) => response.banners.filter((ad) => ad.ativo)),
    );
  }
}
