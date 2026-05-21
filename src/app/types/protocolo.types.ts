// Interface para tipagem
interface ProtocoloResponse {
  protocolo: number;
  dataInicio: string;
  horaInicio: string;
  solicitante: string;
  duracao: string | null;
  atendente: string;
  setor: string;
}

// Objeto único retornado pelo backend (não array)
interface ProtocolosClienteResponse {
  idCliente: number;
  db: string;
  totalProtocolos: number;
  protocolos: ProtocoloResponse[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
