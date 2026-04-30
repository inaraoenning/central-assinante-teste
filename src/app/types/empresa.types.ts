// Empresa através do CPF/CNPJ Cliente
export interface ProvedorInfo {
  db: string;
  idEmpresa?: number;
  idMatriz?: number | null;
  idCliente?: number;
  usernameCliente?: string;
  nomeEmpresa?: string;
  nomeAmigavelEmpresa?: string;
  cidadeEmpresa: string;
  ufEmpresa: string;
  enderecoEmpresa: string;
  bairroEmpresa: string;
  cepEmpresa: string;
  telefoneEmpresa?: string;
  suporteEmpresa?: string;
  emailEmpresa?: string;
  cnpjEmpresa?: string;
  dominio: string;
  logoUrl: string;
  cor?: string;
  nomeCliente?: string;
  emailCliente?: string;
}

export interface AuthProvedoresResponse {
  cpfCnpj: string;
  provedores: ProvedorInfo[];
}

// Empresa através do Domínio
export interface EmpresaDominioResponse {
  Db: string;
  IdEmpresa: number;
  NomeEmpresa: string;
  NomeAmigavelEmpresa: string;
  CidadeEmpresa: string;
  UfEmpresa: string;
  EnderecoEmpresa: string;
  CepEmpresa: string;
  BairroEmpresa: string;
  TelefoneEmpresa: string;
  SuporteEmpresa: string;
  EmailEmpresa: string;
  CnpjEmpresa?: string;
  Dominio?: string;
  LogoUrl?: string;
  Cor?: string;
}

export interface AppLoginRequest {
  db: string;
  idEmpresa: number;
  cpfCnpj: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginCliente {
  idCliente: number;
  nome: string;
  cpfCnpj: string;
}

export interface LoginEmpresa {
  idEmpresa: number;
  nome: string;
  cnpj: string | null;
  logoUrl: string | null;
  cor: string | null;
}

export interface AppLoginResponse {
  success: boolean;
  token: string;
  refreshToken?: string | null;
  cliente?: LoginCliente;
  empresa: LoginEmpresa;
  error?: string;
}

export interface DesbloqueioTemporarioRequest {
  k: string;
  db: string;
  codigo_cliente: number;
}

export interface DesbloqueioTemporarioResponse {
  success: boolean;
  mensagem: string;
}

export interface RecuperarRequest {
  db?: string;
  idCliente?: number;
  cpfCnpj?: string;
  token?: string;
  senha?: string;
  repetirSenha?: string;
}

export interface RecuperarResponse {
  success: boolean;
  error: string;
  runId: string;
  messageId: string;
  mensagem: string;
  usedHost: string;
  usedUser: string;
  correlationId: string;
}
