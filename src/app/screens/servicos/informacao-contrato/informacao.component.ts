import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratoService } from '../contrato.service';
import { ClienteService } from '../../meus-dados/cliente.service';
@Component({
  selector: 'app-informacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informacao.component.html',
})
export class InformacaoComponent implements OnInit {
  public contratoService = inject(ContratoService); // Injetar o service para acessar os dados
  private clienteService = inject(ClienteService);

  codigoCliente = computed(() => this.contratoService.contratoSelecionado()?.codigoCliente);
  hashContrato = computed(() => this.contratoService.contratoSelecionado()?.hashContrato);
  cliente = computed(() => this.clienteService.clienteAtual());
  isLoading = computed(() => this.contratoService.isLoading());

  // link para baixar o contrato
  linkContrato = computed(() => {
    const codigo = this.codigoCliente();
    const hash = this.hashContrato();
    if (!codigo || !hash) return '#';
    return this.contratoService.getLinkContrato(codigo, hash);
  });

  ngOnInit(): void {
    this.contratoService.buscarContratos().subscribe(); // Iniciar a busca
    // Embora o service faça tudo sozinho, o Observable do HttpClient
    // é lazy. Ele só dispara a requisição para a API se fizer subscribe nele.
    // Como a lógica de guardar no Signal já está no 'tap' do serviço,
    // na tela só precisa dar o .subscribe() vazio para iniciar busca.
  }
}
