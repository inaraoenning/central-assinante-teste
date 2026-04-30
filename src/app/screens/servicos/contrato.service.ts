import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // para lidar com requisições assíncronas
import { tap, finalize, map } from 'rxjs/operators'; // para lidar com efeitos colaterais
import { Contrato } from '../../models/contrato.model';
import { ContratoDto } from '../../types/contrato.types';
import { EmpresaService } from '../../core/services/empresa.service';

// O decorador @Injectable avisa ao Angular que esta classe é um Serviço.
// 'providedIn: root' - este serviço é um Singleton: o Angular cria
// apenas UMA cópia dele na memória para a aplicação inteira dividir.
@Injectable({ providedIn: 'root' })
export class ContratoService {
  private empresaService = inject(EmpresaService);
  private http = inject(HttpClient);

  // Estados privados
  private _contratos = signal<Contrato[]>([]);
  private _isLoading = signal<boolean>(false);
  private _contratoSelecionado = signal<Contrato | null>(null);

  // Sinais Público (read-only)
  public contratos = computed(() => this._contratos());
  public isLoading = computed(() => this._isLoading());
  public contratoSelecionado = computed(() => this._contratoSelecionado());

  selecionarContrato(id: string): void {
    this._contratoSelecionado.set(
      this._contratos().find((c) => c.id.toString() === id.toString()) || null,
    );
  }

  // Método para buscar/carregar os contratos
  // Retorna um Observable, que é como uma "promessa" de que os dados chegarão.
  buscarContratos(): Observable<any | Contrato[]> {
    this._isLoading.set(true); // Antes da Requisição sair, avisa o Signal de que o carregamento começou
    const url = `${this.empresaService.apiUrl}app/contratos/detalhado`;

    // GET
    return this.http.get<any>(url).pipe(
      map((res) => {
        const listaBruta: ContratoDto[] = res?.data || res || [];
        return listaBruta.map((item) => new Contrato(item));
      }),
      // TAP pega a resposta, guarda no localStorage e atualiza o Signal
      tap((contratos) => {
        this._contratos.set(contratos);
        this._contratoSelecionado.set(contratos[0]);
      }),

      // Finalize - EXECUTA SEMPRE, (sucesso ou erro)
      finalize(() => {
        // Avisa o Signal que o carregamento acabou, para o spinner parar de girar
        this._isLoading.set(false);
      }),
    );
  }

  getLinkContrato(codigoCliente: number, hashContrato: string): string {
    return `https://www.${this.empresaService.empresaAtiva()?.dominio}/central-assinante/contrato/${codigoCliente}?k=${hashContrato}`;
  }
}
