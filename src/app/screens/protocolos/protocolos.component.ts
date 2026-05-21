import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProtocolosService } from './protocolos.service';

@Component({
  selector: 'app-protocolos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './protocolos.component.html',
})
export class ProtocolosComponent implements OnInit {
  private service = inject(ProtocolosService);

  // Backend retorna um objeto único com a lista de protocolos dentro
  dados = signal<ProtocolosClienteResponse | null>(null);
  isLoading = signal<boolean>(false);
  erro = signal<string | null>(null);

  ngOnInit(): void {
    this.carregarProtocolos();
  }

  carregarProtocolos() {
    this.isLoading.set(true);
    this.erro.set(null);

    this.service.buscarProtocolos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dados.set(response.data);
        } else {
          this.erro.set(response.error || 'Erro ao carregar protocolos');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.erro.set(error.error?.error || 'Erro na requisição');
        this.isLoading.set(false);
      },
    });
  }
}
