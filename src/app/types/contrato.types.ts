import { FaturaDto } from './fatura.types';

export interface EmpresaDto {
  idEmpresa: number;
  nome: string;
  nomeAmigavelEmpresa?: string;
  cnpj?: string;
  site?: string;
}

export interface ComboItemDto {
  tipo: string;
  descricao: string;
  valor: number;
  valorAvulso: number;
}

export interface ContratoDto {
  id: number;
  hashContrato: string;
  hashDesbloqueioTemporario: string;
  plano: string;
  valorMensalidade: number;
  diaVencimento: number;
  codigoCliente: number;
  usernameCliente: string;
  corporativo: boolean;
  dedicado: boolean;
  inativo: boolean;
  bloqueado: boolean;
  permiteDesbloqueioTemporario: boolean;
  temFaturaVencida: boolean;
  velocidadeDown: number;
  velocidadeUp: number;
  nomeCliente?: string;
  cpfCnpjCliente?: string;
  enderecoInstalacao?: string;
  enderecoCobranca?: string;
  tipoCombo?: boolean;
  sva?: boolean;
  faturas: FaturaDto[];
  itensCombo?: ComboItemDto[];
  empresa?: EmpresaDto;
  equipamentos?: string[];
  urlContrato?: string;
}
