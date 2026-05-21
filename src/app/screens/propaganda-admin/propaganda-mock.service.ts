import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Propaganda } from '../../types/propaganda.types';

const STORAGE_KEY = 'mock_propagandas';

const SEED: Propaganda[] = [
  {
    id: 1,
    titulo: 'Banner Verão',
    empresa: 'beltraonet.com.br',
    imagemUrl: 'https://placehold.co/800x300/1a73e8/FFFFFF?text=Banner+Ver%C3%A3o',
    link: 'https://beltraonet.com.br',
    ativo: true,
    ordem: 1,
    dataInicio: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    titulo: 'Promo Fibra',
    empresa: 'lifenet.com.br',
    imagemUrl: 'https://placehold.co/800x300/e8371a/FFFFFF?text=Promo+Fibra',
    link: undefined,
    ativo: false,
    ordem: 2,
    dataInicio: '2025-03-01T00:00:00.000Z',
    dataFim: '2025-12-31T00:00:00.000Z',
  },
];

/**
 * Serviço mock que persiste propagandas no localStorage.
 * Substitui o PropagandaService real para testes locais sem backend.
 *
 * CRUD completo:
 *   listar()       → GET  (lê do localStorage)
 *   criar()        → POST (insere e salva)
 *   atualizar()    → PUT  (substitui e salva)
 *   excluir()      → DELETE (remove e salva)
 *   alterarAtivo() → PATCH (altera ativo e salva)
 *   uploadImagem() → retorna ObjectURL do arquivo (sem server)
 */
@Injectable({ providedIn: 'root' })
export class PropagandaMockService {
  // ── Helpers de persistência ──────────────────────────────────────────────

  private ler(): Propaganda[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Propaganda[];
    } catch {
      /* ignore */
    }
    // Primeira vez: semeia com dados de exemplo
    this.salvar(SEED);
    return [...SEED];
  }

  private salvar(lista: Propaganda[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  private proximoId(lista: Propaganda[]): number {
    if (lista.length === 0) return 1;
    return Math.max(...lista.map((p) => p.id ?? 0)) + 1;
  }

  // ── API pública (mesma interface do PropagandaService real) ───────────────

  /** Calcula a próxima ordem com base na lista atual */
  proximaOrdem(lista: Propaganda[]): number {
    if (lista.length === 0) return 1;
    return Math.max(...lista.map((p) => p.ordem)) + 1;
  }

  listar(): Observable<Propaganda[]> {
    return of(this.ler()).pipe(delay(200)); // simula latência de rede
  }

  criar(p: Omit<Propaganda, 'titulo' | 'id'>): Observable<Propaganda> {
    const lista = this.ler();
    const novo: Propaganda = {
      ...p,
      id: this.proximoId(lista),
      titulo: '', // campo admin-only, preenchido pelo componente
    };
    lista.push(novo);
    this.salvar(lista);
    return of(novo).pipe(delay(150));
  }

  atualizar(id: number, p: Omit<Propaganda, 'titulo' | 'id'>): Observable<Propaganda> {
    const lista = this.ler();
    const idx = lista.findIndex((item) => item.id === id);
    if (idx === -1) return throwError(() => new Error(`Propaganda ${id} não encontrada`));
    lista[idx] = { ...lista[idx], ...p };
    this.salvar(lista);
    return of(lista[idx]).pipe(delay(150));
  }

  excluir(id: number): Observable<void> {
    const lista = this.ler().filter((item) => item.id !== id);
    this.salvar(lista);
    return of(undefined).pipe(delay(100));
  }

  alterarAtivo(id: number, ativo: boolean): Observable<Propaganda> {
    const lista = this.ler();
    const idx = lista.findIndex((item) => item.id === id);
    if (idx === -1) return throwError(() => new Error(`Propaganda ${id} não encontrada`));
    lista[idx] = { ...lista[idx], ativo };
    this.salvar(lista);
    return of(lista[idx]).pipe(delay(100));
  }

  /**
   * Upload de imagem: cria um ObjectURL local (sem servidor).
   * A URL funciona enquanto a aba do browser estiver aberta.
   */
  uploadImagem(arquivo: File, _empresa: string): Observable<string> {
    const url = URL.createObjectURL(arquivo);
    return of(url).pipe(delay(300));
  }
}
