export class Cliente {
  codigo: number;
  username: string;
  nome: string;
  cpfCnpj: string;
  inscricao: string;
  bloqueado: boolean;
  celular: string;
  telefone: string;
  email: string;
  rua: string;
  nRua: string;
  bairro: string;
  cidade: string;
  idEmpresa: number;
  nomeEmpresa: string;
  db: string;

  constructor(data: any) {
    this.codigo = data.codigo || data.idCliente;
    this.username = data.username;
    this.nome = data.nome;
    this.cpfCnpj = data.cpfCnpj || data.cpf_cnpj;
    this.inscricao = data.inscricao;
    this.bloqueado = data.bloqueado;
    this.celular = data.celular || '';
    this.telefone = data.telefone || '';
    this.email = data.email || '';
    this.rua = data.rua || '';
    this.nRua = data.nRua || '';
    this.bairro = data.bairro || '';
    this.cidade = data.cidade || '';
    this.idEmpresa = data.idEmpresa;
    this.nomeEmpresa = data.nomeEmpresa;
    this.db = data.db;
  }

  get iniciais(): string {
    if (!this.nome) return 'US';
    return this.nome
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get enderecoCompleto(): string {
    if (!this.rua) return 'Endereço não informado';
    return `${this.rua}, ${this.nRua} - ${this.bairro}, ${this.cidade}`;
  }

  get maskCpfCnpj(): string {
    if (!this.cpfCnpj) return '';
    const clean = this.cpfCnpj.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1******$4');
    }
    if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1**********$5');
    }
    return this.cpfCnpj;
  }

  get maskCelular(): string {
    if (!this.celular) return '';
    const clean = this.celular.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  }
  get maskTelefone(): string {
    if (!this.telefone) return '';
    const clean = this.telefone.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  }

  // Rg ou Inscrição Estadual
  get maskInscricao(): string {
    if (!this.inscricao) return '';
    const clean = this.inscricao.replace(/\D/g, '');
    if (clean.length === 13) {
      return clean.replace(/(\d{3})(\d{8})(\d{2})/, '$1**********$3');
    }
    if (clean.length === 12) {
      return clean.replace(/(\d{3})(\d{7})(\d{2})/, '$1*********$3');
    }
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{6})(\d{2})/, '$1*******$3');
    }
    if (clean.length === 10) {
      return clean.replace(/(\d{3})(\d{5})(\d{2})/, '$1*******$3');
    }
    if (clean.length === 9) {
      return clean.replace(/(\d{3})(\d{4})(\d{2})/, '$1****$3');
    }
    if (clean.length === 8) {
      return clean.replace(/(\d{3})(\d{3})(\d{2})/, '$1****$3');
    }
    return this.inscricao;
  }

  get tipoDocumento(): string {
    if (this.cpfCnpj.length === 0 || this.cpfCnpj.length > 11) {
      return 'Inscrição Estadual';
    }

    return 'RG';
  }

  get tipoCnpjCpf(): string {
    if (this.cpfCnpj.length <= 11) {
      return 'CPF';
    }
    return 'CNPJ';
  }
}
