import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, finalize, map } from 'rxjs/operators';
import { Contrato } from '../../models/contrato.model';
import { ContratoDto } from '../../types/contrato.types';
import { EmpresaService } from '../../core/services/empresa.service';

// Cache localStorage com TTL de 5 minutos
@Injectable({ providedIn: 'root' })
export class ContratoService {
  private empresaService = inject(EmpresaService);
  private http = inject(HttpClient);

  private readonly CACHE_KEY = '@App:contratos';
  private readonly CACHE_TS_KEY = '@App:contratos:ts';
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  // Inicializa do cache para evitar loading em navegações subsequentes
  private _contratos = signal<Contrato[]>(this.carregarDoCache());
  private _isLoading = signal<boolean>(false);
  private _contratoSelecionado = signal<Contrato | null>(this.carregarDoCache()[0] ?? null);

  // Sinais públicos read-only
  public contratos = this._contratos.asReadonly();
  public isLoading = computed(() => this._isLoading());
  public contratoSelecionado = computed(() => this._contratoSelecionado());

  private carregarDoCache(): Contrato[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      const tsRaw = localStorage.getItem(this.CACHE_TS_KEY);
      if (!cached || !tsRaw) return [];
      if (Date.now() - Number(tsRaw) > this.CACHE_TTL_MS) {
        localStorage.removeItem(this.CACHE_KEY);
        localStorage.removeItem(this.CACHE_TS_KEY);
        return [];
      }
      return JSON.parse(cached).map((c: ContratoDto) => new Contrato(c));
    } catch {
      return [];
    }
  }

  selecionarContrato(id: string): void {
    this._contratoSelecionado.set(
      this._contratos().find((c) => c.id.toString() === id.toString()) || null,
    );
  }

  // Injeta contratos diretamente no signal — usado em mocks e 2ª via.
  setContratosMock(rawList: ContratoDto[]): void {
    const contratos = rawList.map((c) => new Contrato(c));
    this._contratos.set(contratos);
    if (!this._contratoSelecionado() && contratos.length > 0) {
      this._contratoSelecionado.set(contratos[0]);
    }
  }

  // Busca contratos do backend. Se cache válido e dados já estiverem no signal retorna sem fazer nova requisição
  buscarContratos(): Observable<Contrato[]> {
    const tsRaw = localStorage.getItem(this.CACHE_TS_KEY);
    const cacheValido = !!tsRaw && Date.now() - Number(tsRaw) < this.CACHE_TTL_MS;

    if (cacheValido && this._contratos().length > 0) {
      return of(this._contratos()); // cache hit — sem HTTP
    }

    this._isLoading.set(true);
    const url = `${this.empresaService.apiUrl}app/contratos/detalhado`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const payload = res?.data || res;
        const rawList = Array.isArray(payload) ? payload : payload?.contratos || [];
        return rawList.map((c: ContratoDto) => new Contrato(c));
      }),
      tap((contratos) => {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(contratos));
        localStorage.setItem(this.CACHE_TS_KEY, Date.now().toString());
        this._contratos.set(contratos);
        this._contratoSelecionado.set(contratos[0] ?? null);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  getLinkContrato(codigoCliente: number, hashContrato: string): string {
    return `https://www.${this.empresaService.empresaAtiva()?.dominio}/central-assinante/contrato/${codigoCliente}?k=${hashContrato}`;
  }
}
