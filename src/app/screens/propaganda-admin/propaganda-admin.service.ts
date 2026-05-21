import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Propaganda, UploadImagemResponse, Empresa } from '../../types/propaganda.types';

@Injectable({ providedIn: 'root' })
export class PropagandaAdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private _empresas = signal<Empresa[]>([]);
  readonly empresas = this._empresas.asReadonly(); // exposto para o componente ler

  listar(): Observable<Propaganda[]> {
    return this.http.get<Propaganda[]>(`${this.apiUrl}admin/propaganda`);
  }

  // Calcula a próxima ordem com base na lista atual */
  proximaOrdem(lista: Propaganda[]): number {
    if (lista.length === 0) return 1;
    return Math.max(...lista.map((p) => p.ordem)) + 1;
  }

  //Envia o arquivo de imagem para o servidor via multipart/form-data.
  //O backend salva na pasta correta e retorna a URL pública.
  uploadImagem(arquivo: File, empresa: string): Observable<string> {
    const form = new FormData();
    form.append('file', arquivo, arquivo.name);
    form.append('empresa', empresa); // backend pode organizar por subpasta de empresa
    return this.http
      .post<UploadImagemResponse>(`${this.apiUrl}admin/propaganda/upload`, form)
      .pipe(map((res) => res.url));
  }

  // Cria uma nova propaganda.
  // Nota: `titulo` é campo admin-only — se o backend não aceitar, remova antes de enviar.

  criar(p: Omit<Propaganda, 'titulo' | 'id'>): Observable<Propaganda> {
    return this.http.post<Propaganda>(`${this.apiUrl}admin/propaganda`, p);
  }

  atualizar(id: number, p: Omit<Propaganda, 'titulo' | 'id'>): Observable<Propaganda> {
    return this.http.put<Propaganda>(`${this.apiUrl}admin/propaganda/${id}`, p);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}admin/propaganda/${id}`);
  }

  alterarAtivo(id: number, ativo: boolean): Observable<Propaganda> {
    return this.http.patch<Propaganda>(`${this.apiUrl}admin/propaganda/${id}`, { ativo });
  }

  // Carrega a lista de empresas da API e salva no signal
  carregarEmpresas(): void {
    const fullUrl = `${this.apiUrl}app/empresas`; // sem barra dupla

    this.http
      .get<any>(fullUrl)
      .pipe(
        catchError((err) => {
          console.warn('[PropagandaService] Erro ao buscar empresas:', err);
          return of([]);
        }),
      )
      .subscribe((res) => {
        const dados: Empresa[] = Array.isArray(res) ? res : (res?.data ?? []);
        this._empresas.set(dados);
      });
  }
}
