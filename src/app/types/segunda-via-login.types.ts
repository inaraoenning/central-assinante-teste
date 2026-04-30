export interface SegundaViaLoginRequest {
  cpfCnpj: string;
  ultimos4Telefone: string;
  db: string;
  idEmpresa: number;
}

export interface SegundaViaLoginResponse {
  success: boolean;
  token: string | null;
  expiresInSeconds: number;
  error: string | null;
  empresa: object | null;
  cadastros: SegundaViaCadastroDto[];
}

export interface SegundaViaCadastroDto {
  idCliente: number;
  nome: string;
  username: string;
  telefoneMascarado: string | null;
}
