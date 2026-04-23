import { Fatura } from './fatura.model';
import { FaturaDto } from '../types/fatura.types';
import { ContratoDto, ComboItemDto, EmpresaDto } from '../types/contrato.types';

export class Contrato {
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
  faturas: Fatura[];
  permiteDesbloqueioTemporario: boolean;
  itensCombo: ComboItemDto[];
  velocidadeDown: number;
  velocidadeUp: number;
  nomeCliente?: string;
  cpfCnpjCliente?: string;
  enderecoInstalacao?: string;
  enderecoCobranca?: string;
  empresa?: EmpresaDto;
  equipamentos?: string[];
  urlContrato?: string;

  constructor(data: ContratoDto) {
    this.id = data.id;
    this.hashContrato = data.hashContrato;
    this.hashDesbloqueioTemporario = data.hashDesbloqueioTemporario;
    this.plano = data.plano;
    this.valorMensalidade = data.valorMensalidade;
    this.diaVencimento = data.diaVencimento;
    this.codigoCliente = data.codigoCliente;
    this.usernameCliente = data.usernameCliente;
    this.corporativo = data.corporativo;
    this.dedicado = data.dedicado;
    this.inativo = data.inativo;
    this.bloqueado = data.bloqueado || false;
    this.faturas = (data.faturas || []).map((f: FaturaDto) => new Fatura(f));
    this.permiteDesbloqueioTemporario = data.permiteDesbloqueioTemporario;
    this.itensCombo = data.itensCombo || [];
    this.velocidadeDown = data.velocidadeDown / 1000;
    this.velocidadeUp = data.velocidadeUp / 1000;
    this.nomeCliente = data.nomeCliente;
    this.cpfCnpjCliente = data.cpfCnpjCliente;
    this.enderecoInstalacao = data.enderecoInstalacao;
    this.enderecoCobranca = data.enderecoCobranca;
    this.empresa = data.empresa;
    this.equipamentos = data.equipamentos || [];
    this.urlContrato = data.urlContrato;
  }

  get temFaturaVencida(): boolean {
    return this.faturas.some((f) => f.estaVencida);
  }

  get temFaturaAberta(): boolean {
    return this.faturas.some((f) => f.estaAberta);
  }

  get statusGeral(): 'vencida' | 'aberta' | 'paga' {
    if (this.temFaturaVencida) return 'vencida';
    if (this.temFaturaAberta) return 'aberta';
    return 'paga';
  }

  get corStatus(): string {
    switch (this.statusGeral) {
      case 'vencida':
        return 'error';
      case 'aberta':
        return 'info';
      case 'paga':
        return 'success';
    }
  }

  get iconeStatus(): string {
    switch (this.statusGeral) {
      case 'vencida':
        return 'alert-circle';
      case 'aberta':
        return 'calendar-outline';
      case 'paga':
        return 'checkmark-circle';
    }
  }
}
