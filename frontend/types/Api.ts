// Formato do JSON que o backend devolve (docs/api.md)

export type PerfilUsuario = "ADMINISTRADOR" | "GERENTE" | "OPERADOR";
export type UnidadeMedida = "UNIDADE" | "KG" | "LITRO";
export type MotivoMovimentacao = "RECEBIMENTO" | "DEVOLUCAO" | "VENDA" | "PERDA" | "VENCIMENTO" | "AJUSTE";

export interface Referencia { id: number; nome: string }

export interface ApiUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  setor: string | null;
  ativo: boolean;
}

export interface ApiProduto {
  id: number;
  codigo: string;
  codigoBarras?: string;
  nome: string;
  categoria?: Referencia;
  fornecedor?: Referencia;
  unidadeMedida: UnidadeMedida;
  estoqueMinimo: number;
  precoEntrada: number;
  precoSaida: number;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
}

export interface ApiLote {
  id: number;
  codigo: string;
  produto: { id: number; nome: string; unidadeMedida: UnidadeMedida };
  dataRecebimento: string;
  dataValidade: string | null;
  quantidadeAtual: number;
  precoCusto: number | null;
  situacao: "ATIVO" | "BAIXADO" | "DESCARTADO";
}

export interface ApiMovimentacao {
  id: number;
  dataHora: string;
  tipo: "ENTRADA" | "SAIDA";
  motivo: MotivoMovimentacao;
  produto: Referencia;
  lote: { id: number; codigo: string };
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  usuario: Referencia;
  observacao: string | null;
}

export interface Pagina<T> {
  itens: T[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
}

export interface ApiRecebimento {
  id: number;
  numeroNota: string;
  status: "EM_CONFERENCIA" | "COM_DIVERGENCIA" | "CONCLUIDO" | "CANCELADO";
  totalItens: number;
  itensConferidos: number;
  valorNota: number;
  itens: {
    id: number;
    produtoId: number;
    produtoNome: string;
    quantidadeNota: number;
    quantidadeConferida: number | null;
    valorUnitario: number;
    divergente: boolean;
  }[];
}

export interface ApiRelatorioPerdas {
  inicio: string;
  fim: string;
  valorTotal: number;
  porMes: { mes: string; valorTotal: number }[];
  itens: { dataHora: string; produto: Referencia; lote: string; motivo: MotivoMovimentacao; quantidade: number; valorTotal: number; observacao: string | null }[];
}
