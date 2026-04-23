import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fatura2ViaService } from './fatura-2-via.service';

@Component({
  selector: 'app-fatura-2-via',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fatura-2-via.component.html',
})
export class Fatura2ViaComponent implements OnInit {
  readonly fatura2ViaService = inject(Fatura2ViaService);

  // Signals expostos ao template
  contratos = this.fatura2ViaService.contratos;
  contratosComPendencia = this.fatura2ViaService.contratosComPendencia;
  contratoSelecionado = this.fatura2ViaService.contratoSelecionado;
  faturasAbertas = this.fatura2ViaService.faturasAbertas;
  isLoading = this.fatura2ViaService.isLoading;

  ngOnInit(): void {
    this.loadContratosMock();
  }

  selecionarContrato(id: number): void {
    this.fatura2ViaService.setContratoSelecionado(id);
  }

  loadContratosMock() {
    // Dados Mockados para teste da tela 2 via
    const mockData = [
      {
        id: 123,
        hashContrato: 'abc',
        hashDesbloqueioTemporario: 'def',
        plano: 'Plano Fibra 500 Mega',
        valorMensalidade: 99.9,
        diaVencimento: 10,
        codigoCliente: 456,
        usernameCliente: 'jose.silva',
        corporativo: false,
        dedicado: false,
        inativo: false,
        bloqueado: false,
        permiteDesbloqueioTemporario: true,
        temFaturaVencida: true,
        velocidadeDown: 500,
        velocidadeUp: 250,
        faturas: [
          {
            idTitulo: 1001,
            idEmpresa: 1,
            idEmpresaTj: 1,
            idPagamento: 21,
            pagamento: 'Boleto',
            valor: 99.9,
            valorPago: 0,
            desconto: 0,
            juros: 0,
            vencimento: new Date().toISOString(), // Hoje (vencendo)
            pago: false,
            situacao: 'Aberta',
            visualizarBoleto: true,
            pagoViaWebhook: false,
          },
          {
            idTitulo: 1002,
            idEmpresa: 1,
            idEmpresaTj: 1,
            idPagamento: 21,
            pagamento: 'Boleto',
            valor: 99.9,
            valorPago: 0,
            desconto: 0,
            juros: 5.5,
            vencimento: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), // 15 dias atrás
            pago: false,
            situacao: 'Vencida',
            visualizarBoleto: true,
            pagoViaWebhook: false,
          },
          {
            idTitulo: 1003,
            idEmpresa: 1,
            idEmpresaTj: 1,
            idPagamento: 21,
            pagamento: 'Boleto',
            valor: 99.9,
            valorPago: 99.9,
            desconto: 0,
            juros: 0,
            vencimento: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), // Mês passado
            pago: true,
            situacao: 'Pago',
            visualizarBoleto: true,
            pagoViaWebhook: false,
          },
        ],
      },
      {
        id: 1234,
        hashContrato: 'abc',
        hashDesbloqueioTemporario: 'def',
        plano: 'Plano Fibra 500 Mega',
        valorMensalidade: 9239.9,
        diaVencimento: 10,
        codigoCliente: 456,
        usernameCliente: 'jose.silva',
        corporativo: false,
        dedicado: false,
        inativo: false,
        bloqueado: false,
        permiteDesbloqueioTemporario: true,
        temFaturaVencida: true,
        velocidadeDown: 500,
        velocidadeUp: 250,
        faturas: [
          {
            idTitulo: 1001,
            idEmpresa: 1,
            idEmpresaTj: 1,
            idPagamento: 21,
            pagamento: 'Boleto',
            valor: 9559.9,
            valorPago: 0,
            desconto: 0,
            juros: 0,
            vencimento: new Date().toISOString(), // Hoje (vencendo)
            pago: false,
            situacao: 'Aberta',
            visualizarBoleto: true,
            pagoViaWebhook: false,
          },
          {
            idTitulo: 1002,
            idEmpresa: 1,
            idEmpresaTj: 1,
            idPagamento: 21,
            pagamento: 'Boleto',
            valor: 99.9,
            valorPago: 0,
            desconto: 0,
            juros: 5.5,
            vencimento: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), // 15 dias atrás
            pago: false,
            situacao: 'Vencida',
            visualizarBoleto: true,
            pagoViaWebhook: false,
          },
          {
            idTitulo: 1003,
            idEmpresa: 1,
            idEmpresaTj: 1,
            idPagamento: 21,
            pagamento: 'Boleto',
            valor: 99.9,
            valorPago: 99.9,
            desconto: 0,
            juros: 0,
            vencimento: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), // Mês passado
            pago: true,
            situacao: 'Pago',
            visualizarBoleto: true,
            pagoViaWebhook: false,
          },
        ],
      },
    ] as any[];

    this.fatura2ViaService.carregarContratos(mockData);
  }
}
