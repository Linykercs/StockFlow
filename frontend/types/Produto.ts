export type Unit = "PCT" | "UN" | "KG" | "L" | "CX";

export type ProductStatus = "Em estoque" | "Abaixo do mínimo" | "Sem estoque";

export interface Batch {
  id: string;
  productId: string;
  code: string;
  receivedAt: string;
  expiresAt: string;
  quantity: number;
  initialQuantity: number;
  blocked?: boolean;
  prioritized?: boolean;
}

export interface Produto {
  id: string;
  name: string;
  barcode: string;
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
  role: UserRole;
  status: "Ativo" | "Inativo";
}

export interface NewProductInput {
  name: string;
  barcode: string;
  category: string;
  unit: Unit;
  minimumStock: number;
  costPrice: number;
  salePrice: number;
  firstBatch?: Omit<Batch, "id" | "productId">;
}
