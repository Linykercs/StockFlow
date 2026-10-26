/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { ApiLote, ApiMovimentacao, ApiProduto, ApiUsuario, MotivoMovimentacao, Pagina, Referencia } from "../types/Api";
import type { Batch, ExitReason, NewProductInput, Produto, StockMovement, StockUser, UserInput } from "../types/Produto";
import { getStock } from "../utils/stock";
import { nomeDoPerfil, useAuth } from "./AuthContext";

type EntryInput = { productId: string; quantity: number; unitValue: number; batchCode: string; expiresAt: string };
type ExitInput = { productId: string; quantity: number; reason: ExitReason; batchIds: string[] };

interface StockContextValue {
  products: Produto[];
  movements: StockMovement[];
  users: StockUser[];
  categories: Referencia[];
  loading: boolean;
  loadError: string;
  reload: () => Promise<void>;
  addProduct: (input: NewProductInput) => Promise<string>;
  updateProduct: (id: string, input: NewProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  registerEntry: (input: EntryInput) => Promise<void>;
  registerExit: (input: ExitInput) => Promise<void>;
  writeOffBatch: (productId: string, batchId: string) => Promise<void>;
  togglePrioritized: (productId: string, batchId: string) => void;
  addUser: (user: UserInput) => Promise<void>;
  updateUser: (id: string, user: UserInput) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const StockContext = createContext<StockContextValue | null>(null);

export const nomeDoMotivo: Record<MotivoMovimentacao, string> = {
  RECEBIMENTO: "Entrada por nota fiscal",
  DEVOLUCAO: "Devolução",
  VENDA: "Venda / reposição de gôndola",
  PERDA: "Avaria / perda",
  VENCIMENTO: "Produto vencido",
  AJUSTE: "Ajuste de estoque",
};

// "Priorizar venda" ainda não existe no banco: fica guardado só neste navegador
const CHAVE_PRIORIDADE = "stockflow:lotes-priorizados";
const lerPriorizados = (): string[] => {
  try { return JSON.parse(localStorage.getItem(CHAVE_PRIORIDADE) ?? "[]"); } catch { return []; }
};

const paraLote = (lote: ApiLote, priorizados: string[]): Batch => ({
  id: String(lote.id),
  productId: String(lote.produto.id),
  code: lote.codigo,
  receivedAt: lote.dataRecebimento,
  expiresAt: lote.dataValidade ?? "",
  quantity: Number(lote.quantidadeAtual),
  initialQuantity: Number(lote.quantidadeAtual),
  costPrice: Number(lote.precoCusto ?? 0),
  blocked: lote.situacao !== "ATIVO",
  prioritized: priorizados.includes(String(lote.id)),
});

const paraProduto = (produto: ApiProduto, lotes: Batch[]): Produto => ({
  id: String(produto.id),
  code: produto.codigo,
  name: produto.nome,
  barcode: produto.codigoBarras ?? "",
  categoryId: produto.categoria?.id ?? null,
  category: produto.categoria?.nome ?? "Sem categoria",
  unit: produto.unidadeMedida,
  minimumStock: Number(produto.estoqueMinimo),
  costPrice: Number(produto.precoEntrada),
  salePrice: Number(produto.precoSaida),
  batches: lotes.filter((lote) => lote.productId === String(produto.id)),
});

// perda e vencimento aparecem como "Baixa" nas telas, igual ao protótipo
const paraMovimentacao = (m: ApiMovimentacao): StockMovement => ({
  id: String(m.id),
  productId: String(m.produto.id),
  productName: m.produto.nome,
  batchCode: m.lote.codigo,
  type: m.tipo === "ENTRADA" ? "Entrada" : m.motivo === "PERDA" || m.motivo === "VENCIMENTO" ? "Baixa" : "Saída",
  quantity: Number(m.quantidade),
  unitValue: Number(m.valorUnitario),
  reason: m.observacao ? `${nomeDoMotivo[m.motivo]} · ${m.observacao}` : nomeDoMotivo[m.motivo],
  user: m.usuario.nome,
  createdAt: m.dataHora,
});

const paraUsuario = (u: ApiUsuario): StockUser => ({
  id: String(u.id),
  name: u.nome,
  email: u.email,
  profile: u.perfil,
  role: nomeDoPerfil[u.perfil],
  sector: u.setor ?? "",
  status: u.ativo ? "Ativo" : "Inativo",
});

export function StockProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [products, setProducts] = useState<Produto[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [users, setUsers] = useState<StockUser[]>([]);
  const [categories, setCategories] = useState<Referencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const reload = useCallback(async () => {
    if (!usuario) return;
    try {
      const [produtos, ativos, baixados, descartados, movimentacoes, categorias, usuarios] = await Promise.all([
        api.get<ApiProduto[]>("/produtos"),
        api.get<ApiLote[]>("/lotes"),
        api.get<ApiLote[]>("/lotes?situacao=BAIXADO"),
        api.get<ApiLote[]>("/lotes?situacao=DESCARTADO"),
        api.get<Pagina<ApiMovimentacao>>("/movimentacoes?tamanho=100"),
        api.get<Referencia[]>("/categorias"),
        usuario.perfil === "ADMINISTRADOR" ? api.get<ApiUsuario[]>("/usuarios") : Promise.resolve([]),
      ]);
      const priorizados = lerPriorizados();
      const lotes = [...ativos, ...baixados, ...descartados].map((lote) => paraLote(lote, priorizados));
      setProducts(produtos.map((produto) => paraProduto(produto, lotes)));
      setMovements(movimentacoes.itens.map(paraMovimentacao));
      setCategories(categorias);
      setUsers(usuarios.map(paraUsuario));
      setLoadError("");
    } catch (erro) {
      setLoadError(erro instanceof Error ? erro.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  // busca os dados ao entrar; os setState só rodam depois da resposta do servidor
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { reload(); }, [reload]);

  const corpoDoProduto = (input: NewProductInput) => ({
    codigo: input.code.trim(),
    codigoBarras: input.barcode.trim(),
    nome: input.name.trim(),
    categoriaId: input.categoryId,
    unidadeMedida: input.unit,
    estoqueMinimo: input.minimumStock,
    precoEntrada: input.costPrice,
    precoSaida: input.salePrice,
  });

  const addProduct = async (input: NewProductInput) => {
    const criado = await api.post<ApiProduto>("/produtos", corpoDoProduto(input));
    try {
      if (input.firstBatch) {
        await api.post("/movimentacoes/entrada", {
          produtoId: criado.id, codigoLote: input.firstBatch.code, dataValidade: input.firstBatch.expiresAt || null,
          quantidade: input.firstBatch.quantity, valorUnitario: input.costPrice, motivo: "RECEBIMENTO",
        });
      }
    } catch (erro) {
      await reload();
      throw new Error(`Produto cadastrado, mas o primeiro lote não entrou: ${erro instanceof Error ? erro.message : ""}`, { cause: erro });
    }
    await reload();
    return String(criado.id);
  };

  const updateProduct = async (id: string, input: NewProductInput) => {
    await api.put(`/produtos/${id}`, corpoDoProduto(input));
    await reload();
  };

  const deleteProduct = async (id: string) => {
    await api.delete(`/produtos/${id}`);
    await reload();
  };

  const registerEntry = async (input: EntryInput) => {
    await api.post("/movimentacoes/entrada", {
      produtoId: Number(input.productId), codigoLote: input.batchCode.trim(), dataValidade: input.expiresAt || null,
      quantidade: input.quantity, valorUnitario: input.unitValue, motivo: "RECEBIMENTO",
    });
    await reload();
  };

  const registerExit = async (input: ExitInput) => {
    await api.post("/movimentacoes/saida", {
      produtoId: Number(input.productId), quantidade: input.quantity, motivo: input.reason,
      loteIds: input.batchIds.map(Number),
    });
    await reload();
  };

  // RN02: lote vencido sai com motivo VENCIMENTO; lote estragado antes de vencer, com PERDA
  const writeOffBatch = async (productId: string, batchId: string) => {
    const lote = products.find((p) => p.id === productId)?.batches.find((b) => b.id === batchId);
    const vencido = Boolean(lote?.expiresAt) && lote!.expiresAt < new Date().toISOString().slice(0, 10);
    await api.post(`/lotes/${batchId}/baixa`, { situacao: "DESCARTADO", motivo: vencido ? "VENCIMENTO" : "PERDA" });
    await reload();
  };

  const togglePrioritized = (productId: string, batchId: string) => {
    const atuais = lerPriorizados();
    const novos = atuais.includes(batchId) ? atuais.filter((id) => id !== batchId) : [...atuais, batchId];
    try { localStorage.setItem(CHAVE_PRIORIDADE, JSON.stringify(novos)); } catch { /* sem localStorage */ }
    setProducts((lista) => lista.map((p) => p.id !== productId ? p : {
      ...p, batches: p.batches.map((b) => b.id === batchId ? { ...b, prioritized: novos.includes(batchId) } : b),
    }));
  };

  const corpoDoUsuario = (user: UserInput) => ({
    nome: user.name.trim(), email: user.email.trim(), senha: user.password || null,
    perfil: user.profile, setor: user.sector, ativo: user.status === "Ativo",
  });

  const addUser = async (user: UserInput) => { await api.post("/usuarios", corpoDoUsuario(user)); await reload(); };
  const updateUser = async (id: string, user: UserInput) => { await api.put(`/usuarios/${id}`, corpoDoUsuario(user)); await reload(); };
  const deleteUser = async (id: string) => { await api.delete(`/usuarios/${id}`); await reload(); };

  const value = {
    products, movements, users, categories, loading, loadError, reload,
    addProduct, updateProduct, deleteProduct, registerEntry, registerExit, writeOffBatch, togglePrioritized,
    addUser, updateUser, deleteUser,
  };
  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) throw new Error("useStock deve ser usado dentro de StockProvider");
  return context;
}

export const stockOf = getStock;
