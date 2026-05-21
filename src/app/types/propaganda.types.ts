export interface Empresa {
  idEmpresa: number;
  nomeAmigavelEmpresa: string;
  logoUrl?: string;
}

export interface Propaganda {
  id?: number;
  titulo: string; // admin-only: label de identificação no painel
  empresa: string; // domínio do provedor ex: beltraonet.com.br
  imagemUrl: string; // URL da imagem salva no servidor
  link?: string; // URL de destino ao clicar
  ativo: boolean; // sempre true na criação, pode ser alterado depois
  ordem: number; // auto: max(ordem) + 1 na criação
  dataInicio: string; // ISO string
  dataFim?: string; // ISO string opcional
}

/** Retorno do endpoint de upload de imagem */
export interface UploadImagemResponse {
  url: string; // URL pública da imagem salva no servidor
}
