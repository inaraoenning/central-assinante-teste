import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AtualizarContatoDto } from '../../types/cliente.types';
import { EmpresaService } from '../../core/auth/empresa.service';
import { Cliente } from '../../models/cliente.model';

@Injectable({
  providedIn: 'root',
})

// Gerente do Perfil do Usuário
export class ClienteService {
  private http = inject(HttpClient);
  private empresaService = inject(EmpresaService);

  // 1. Estado persistente inicial (buscando do localStorage caso tenha dado F5)
  private _clienteAtual = signal<Cliente | undefined>(this.carregarDoCache()); // Só o próprio ClienteService tem a chave para alterar os dados usando o .set().

  // 2. Variável apenas leitura para as telas importarem
  public clienteAtual = computed(() => this._clienteAtual()); //Qualquer tela (Dashboard, Cabeçalho, Perfil) pode olhar para o clienteAtual()

  // Recupera do Storage para hidratar a tela instantaneamente
  // se o JSON estiver corrompido, o sistema ignora,
  // retorna undefined e segue (forçando o app a buscar os dados na API de novo)
  private carregarDoCache(): Cliente | undefined {
    const cached = localStorage.getItem('@App:clienteInfo');
    if (cached) {
      try {
        return new Cliente(JSON.parse(cached));
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Obtém os dados detalhados do cliente logado, atualiza o storage e o Signal
   * GET /app/cliente/info
   */
  buscarDadosCliente(): Observable<Cliente> {
    const url = `${this.empresaService.apiUrl}app/cliente/info`;
    return this.http.get<any>(url).pipe(
      // TAP pega a resposta, guarda no localStorage e atualiza o Signal
      tap((res) => {
        const dados = res?.data || res;
        // Salva string bruta no storage para F5
        localStorage.setItem('@App:clienteInfo', JSON.stringify(dados));
        // Dispara reatividade para todas as telas logadas
        this._clienteAtual.set(new Cliente(dados));

        // Se a classe Cliente tiver métodos internos (função formatarCpf()),
        // todas as telas que usarem o Signal terão acesso a elas.
      }),
      // MAP pega resposta bruta da API, transforma em uma classe (new Cliente) entrega para o Componente que chamou a função.
      // O Componente só precisa fazer clienteService.buscarDadosCliente().subscribe() e não se preocupa com caches ou Signals.
      // O serviço cuida de tudo.
      map((res) => new Cliente(res?.data || res)),
    );
  }

  /**
   * Atualiza telefone/celular do cliente
   * PATCH /app/cliente/contato
   */
  updateContato(dto: AtualizarContatoDto): Observable<void> {
    const url = `${this.empresaService.apiUrl}app/cliente/contato`;
    return this.http.patch<void>(url, dto);
  }
}
