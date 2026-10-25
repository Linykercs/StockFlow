import type { MotivoMovimentacao, PerfilUsuario, UnidadeMedida } from "./Api";

export type Unit = UnidadeMedida;

export type ProductStatus = "Em estoque" | "Abaixo do mínimo" | "Sem estoque";

export interface Batch {
  id: string;
  productId: string;
  code: string;
  receivedAt: string;
  expiresAt: string;
  quantity: number;
  initialQuantity: number;
  costPrice: number;
  blocked?: boolean;
  prioritized?: boolean;
}

export interface Produto {
  id: string;
  code: string;
  name: string;
  barcode: string;
  categoryId: number | null;
  category: string;
  unit: Unit;
  minimumStock: number;
  costPrice: number;
  salePrice: number;
  batches: Batch[];
}

export type MovementType = "Entrada" | "Saída" | "Baixa";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  batchCode: string;
  type: MovementType;
  quantity: number;
  unitValue: number;
  reason: string;
  user: string;
  createdAt: string;
}

export type UserRole = "Administrador" | "Gerente de estoque" | "Operador";

export interface StockUser {
  id: string;
  name: string;
  email: string;
  profile: PerfilUsuario;
  role: UserRole;
  sector: string;
  status: "Ativo" | "Inativo";
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  profile: PerfilUsuario;
  sector: string;
  status: "Ativo" | "Inativo";
}

export interface NewProductInput {
  code: string;
  name: string;
  barcode: string;
  categoryId: number | null;
  unit: Unit;
  minimumStock: number;
  costPrice: number;
  salePrice: number;
  firstBatch?: { code: string; expiresAt: string; quantity: number };
}

export type ExitReason = Extract<MotivoMovimentacao, "VENDA" | "PERDA" | "AJUSTE">;
