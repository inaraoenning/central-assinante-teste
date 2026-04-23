import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from './cliente.service';
import { Cliente } from '../../models/cliente.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-meus-dados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meus-dados.component.html',
})
export class MeusDadosComponent implements OnInit {
  private clienteService = inject(ClienteService);

  // Aponta para o sinal de cliente do service
  cliente = this.clienteService.clienteAtual;

  // Detalhes completos vindo da API
  clienteFull = signal<Cliente | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.carregarDetalhes();
  }

  carregarDetalhes(): void {
    this.isLoading.set(true);
    this.clienteService
      .buscarDadosCliente()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.clienteFull.set(data),
        error: (err) => console.error('Erro ao carregar detalhes do cliente:', err),
      });
  }
}
