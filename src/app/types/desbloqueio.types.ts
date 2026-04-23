export interface DesbloqueioTemporarioRequest {
  k: string;
  db: string;
  codigo_cliente: number;
}

export interface DesbloqueioTemporarioResponse {
  success: boolean;
  mensagem: string;
}
