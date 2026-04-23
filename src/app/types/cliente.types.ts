export interface ClienteMeResponse {
  // Identidade
  codigo: number;
  username: string;
  nome: string;
  cpfCnpj: string;
  inscricao: string;

  // Status
  bloqueado: boolean;

  // Contato (opcionais)
  celular: string;
  telefone: string;
  email: string;
  rua: string;
  nRua: string;
  bairro: string;
  cidade: string;

  // Tenant / Empresa
  idEmpresa: number;
  nomeEmpresa: string;
  db: string;
}

export interface AtualizarContatoDto {
  telefone?: string;
  celular?: string;
}
