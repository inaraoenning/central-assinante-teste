import { FaturaDto, Servicos } from '../types/fatura.types';

export class Fatura {
  idTitulo: number;
  idEmpresa: number;
  idEmpresaTj: number;
  idPagamento: number;
  pagamento: string;
  valor: number;
  valorPago: number;
  desconto: number;
  juros: number;
  mesAno: number;
  anoMes: number;
  vencimento: string;
  dataEmissao: string;
  pago: boolean;
  situacao: string;
  visualizarBoleto: boolean;
  pagoViaWebhook: boolean;
  servicos: Servicos[];
  textoImagemQRcodePix?: string;
  dataPago?: string;
  txIdPix?: string;
  urlPix?: string;
  hashNF?: string;
  hashNFR?: string;
  hashNFS?: string;
  hashNfcom?: string;

  constructor(data: FaturaDto) {
    this.idTitulo = data.idTitulo;
    this.idEmpresa = data.idEmpresa;
    this.idEmpresaTj = data.idEmpresaTj;
    this.idPagamento = data.idPagamento;
    this.pagamento = data.pagamento;
    this.valor = data.valor;
    this.valorPago = data.valorPago;
    this.desconto = data.desconto;
    this.juros = data.juros;
    this.mesAno = data.mesAno || 0;
    this.anoMes = data.anoMes || 0;
    this.vencimento = data.vencimento;
    this.dataEmissao = data.dataEmissao || '';
    this.pago = data.pago;
    this.situacao = data.situacao;
    this.visualizarBoleto = data.visualizarBoleto;
    this.pagoViaWebhook = data.pagoViaWebhook;
    this.servicos = data.servicos || [];
    this.textoImagemQRcodePix = data.textoImagemQRcodePix;
    this.dataPago = data.dataPago;
    this.txIdPix = data.txIdPix;
    this.urlPix = data.urlPix;
    this.hashNF = data.hashNF;
    this.hashNFR = data.hashNFR;
    this.hashNFS = data.hashNFS;
    this.hashNfcom = data.hashNfcom;
  }

  // REGRA DE NEGÓCIO: Verificar se está vencida
  get estaVencida(): boolean {
    if (this.pago) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return new Date(this.vencimento) < hoje;
  }

  // REGRA DE NEGÓCIO: Verificar se está aberta (mês atual, não paga, não vencida)
  get estaAberta(): boolean {
    return !this.pago && !this.estaVencida;
  }

  // REGRA DE NEGÓCIO: Status para UI
  get statusParaUI(): 'vencida' | 'aberta' | 'paga' {
    if (this.pago) return 'paga';
    if (this.estaVencida) return 'vencida';
    return 'aberta';
  }

  // REGRA DE NEGÓCIO: Label textual do status
  get labelStatus(): string {
    switch (this.statusParaUI) {
      case 'vencida': return 'VENCIDA';
      case 'aberta': return 'ABERTA';
      case 'paga': return 'PAGO';
    }
  }

  // REGRA DE NEGÓCIO: Cor baseada no status (classes para o DaisyUI)
  get corStatus(): string {
    switch (this.statusParaUI) {
      case 'vencida': return 'error';
      case 'aberta': return 'info';
      case 'paga': return 'success';
    }
  }

  // REGRA DE NEGÓCIO: Ícone baseado no status
  get iconeStatus(): string {
    switch (this.statusParaUI) {
      case 'vencida': return 'alert-circle';
      case 'aberta': return 'calendar-outline';
      case 'paga': return 'checkmark-circle';
    }
  }
}
