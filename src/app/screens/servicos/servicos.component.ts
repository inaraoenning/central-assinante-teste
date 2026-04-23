import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratoService } from './contrato.service';
import { ContratoComponent } from './contratos/contrato.component';
import { InformacaoComponent } from './informacao-contrato/informacao.component';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, ContratoComponent, InformacaoComponent],
  templateUrl: './servicos.component.html',
})
export class ServicosComponent implements OnInit {
  public contratoService = inject(ContratoService); // Injetar o service para acessar os dados

  ngOnInit(): void {
    this.contratoService.buscarContratos().subscribe(); // Iniciar a busca
    // Embora o service faça tudo sozinho, o Observable do HttpClient
    // é lazy. Ele só dispara a requisição para a API se fizer subscribe nele.
    // Como a lógica de guardar no Signal já está no 'tap' do serviço,
    // na tela só precisa dar o .subscribe() vazio para iniciar busca.
  }

  isSkeelo(plano: string): boolean {
    return plano?.toLowerCase().includes('skeelo') ?? false;
  }
}
