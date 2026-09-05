export type PerfilUsuario = "ADMINISTRADOR" | "GERENTE" | "OPERADOR";
export type UnidadeMedida = "UNIDADE" | "CAIXA" | "KG" | "LITRO";
export type TipoMovimentacao = "ENTRADA" | "SAIDA";
export type StatusLote = "EM_ESTOQUE" | "BAIXO" | "VENCENDO" | "VENCIDO";

export interface Produto {
  id: number;
  nome: string;
  codigoBarras: string | null;
  unidadeMedida: UnidadeMedida;
  estoqueMinimo: number;
  quantidadeTotal: number;
  categoria: string | null;
  fornecedor: string | null;
  ativo: boolean;
}

export interface Lote {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  dataValidade: string | null;
  dataEntrada: string;
  precoCusto: number | null;
  status: StatusLote;
}

export interface Movimentacao {
  id: number;
  loteId: number;
  produtoNome: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string | null;
  usuarioNome: string;
  dataHora: string;
}

export interface DashboardResumo {
  totalProdutos: number;
  lotesEmEstoque: number;
  lotesEstoqueBaixo: number;
  lotesVencendo: number;
  lotesVencidos: number;
  alertas: Lote[];
}

export interface UsuarioLogado {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  token: string;
}
