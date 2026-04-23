export interface FaturaDto {
  idTitulo: number;
  idEmpresa: number;
  idEmpresaTj: number;
  idPagamento: number;
  pagamento: string;
  valor: number;
  valorPago: number;
  desconto: number;
  juros: number;
  vencimento: string;
  dataEmissao?: string;
  dataPago?: string;
  pago: boolean;
  situacao: string;
  visualizarBoleto: boolean;
  textoImagemQRcodePix?: string;
  servicos: Servicos[];
  txIdPix?: string;
  urlPix?: string;
  hashNF?: string;
  hashNFR?: string;
  hashNFS?: string;
  hashNfcom?: string;
  pagoViaWebhook: boolean;
  mesAno?: number; // Formato: MMYYYY (ex: 112026 = Nov/2026)
  anoMes?: number; // Formato: YYYYMM (ex: 202611 = 2026-11)
}

export interface Servicos {
  cobrancaId: number;
  planoId: number;
  planoNome: string;
}
