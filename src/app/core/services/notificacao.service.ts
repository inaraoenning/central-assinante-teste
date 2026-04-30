import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notificacao } from '../../models/notificacao.model';
import { EmpresaService } from './empresa.service';

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  // URL da api
  private http = inject(HttpClient);
  private empresa = inject(EmpresaService);

  // Estado privado: Apenas o serviço pode modificar a lista diretamente
  #notificacao = signal<Notificacao[]>([]);

  // Estado público: Somente leitura para as telas
  public notificacao = this.#notificacao.asReadonly();

  // Estado Computado: Atualizar automaticamente sempre que a lista mudar
  public qtdeNaoLida = computed(() => {
    return this.#notificacao().filter((n) => !n.lida).length;
  });

  // Método de Ação: Requisição HTTP + Atualização do Signal

  public carregarNotificacoes(): void {
    // this.http.get<Notificacao[]>(this.empresa.apiUrl).subscribe({
    this.http.get<Notificacao[]>('http://localhost:3000/notificacao').subscribe({
      next: (dados) => {
        // Substitui o valor inteiro do signal
        this.#notificacao.set(dados);
      },
      error: (error) => console.error('Erro ao buscar notificações: ', error),
    });
  }

  public marcarComoLida(id: string): void {
    // PATCH apenas com a propriedade que mudou
    this.http.patch(`http://localhost:3000/notificacao/${id}`, { lida: true }).subscribe({
      next: () => {
        // Se a API retornar sucessom, atualizamos o estado local reativamente
        this.#notificacao.update((listaAtual) =>
          listaAtual.map((notificacao) =>
            notificacao.id === id ? { ...notificacao, lida: true } : notificacao,
          ),
        );
      },
    });
  }

  public marcarTodasComoLidas(): void {
    // json-server não suporta bulk update nativo.
    // Atualizamos apenas o estado local do signal para refletir visualmente.
    // Em produção, chamar um endpoint próprio da API (ex: PATCH /notificacoes/ler-todas)
    this.#notificacao.update((listaAtual) => listaAtual.map((n) => ({ ...n, lida: true })));
  }
}
