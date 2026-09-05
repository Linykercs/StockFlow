import { api } from "./api";
import type { DashboardResumo, Lote, Movimentacao, Produto } from "../types/estoque";

export async function listarProdutos(): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>("/produtos");
  return data;
}

export async function listarLotesPorProduto(produtoId: number): Promise<Lote[]> {
  const { data } = await api.get<Lote[]>("/lotes", { params: { produtoId } });
  return data;
}

export async function listarMovimentacoesRecentes(): Promise<Movimentacao[]> {
  const { data } = await api.get<Movimentacao[]>("/movimentacoes");
  return data;
}

export async function buscarDashboard(): Promise<DashboardResumo> {
  const { data } = await api.get<DashboardResumo>("/dashboard");
  return data;
}
