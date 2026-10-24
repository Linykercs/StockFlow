import type { Produto, ProductStatus } from "../types/Produto";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
};

export const daysUntil = (value: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
};

export const getStock = (product: Produto) =>
  product.batches.reduce((total, batch) => total + Math.max(0, batch.quantity), 0);

export const getProductStatus = (product: Produto): ProductStatus => {
  const stock = getStock(product);
  if (stock <= 0) return "Sem estoque";
  if (stock < product.minimumStock) return "Abaixo do mínimo";
  return "Em estoque";
};

export const getBatchState = (expiresAt: string, blocked?: boolean) => {
  if (blocked) return { type: "blocked", label: "Bloqueado" } as const;
  const days = daysUntil(expiresAt);
  if (days < 0) return { type: "expired", label: "Lote vencido" } as const;
  if (days <= 7) return { type: "expiring", label: days === 0 ? "Vence hoje" : `Vence em ${days} dias` } as const;
  return { type: "valid", label: "Dentro da validade" } as const;
};

export const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
