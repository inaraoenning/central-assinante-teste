export interface ProvedorInfo {
  db: string;
  idEmpresa?: number;
  idMatriz?: number | null;
  idCliente?: number;
  usernameCliente?: string;
  nomeEmpresa?: string;
  nome?: string;
  nomeAmigavel?: string;
  nomeAmigavelEmpresa?: string;
  telefoneEmpresa?: string;
  telefone?: string;
  telefone0800?: string;
  suporteEmpresa?: string;
  suporte?: string;
  emailEmpresa?: string;
  email?: string;
  cnpjEmpresa?: string;
  dominio: string;
  logoUrl: string;
  cor?: string;
  nomeCliente?: string;
  emailCliente?: string;
  cidade?: string;
  uf?: string;
  bairro?: string;
  endereco?: string;
}

export interface AuthProvedoresResponse {
  cpfCnpj: string;
  provedores: ProvedorInfo[];
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
