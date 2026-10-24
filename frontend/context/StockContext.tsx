/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import { initialMovements, initialProducts, initialUsers } from "../data/initialData";
import type { Batch, NewProductInput, Produto, StockMovement, StockUser } from "../types/Produto";
import { getStock, uid } from "../utils/stock";

type EntryInput = { productId: string; quantity: number; unitValue: number; batchCode: string; receivedAt: string; expiresAt: string };
type ExitInput = { productId: string; quantity: number; reason: string; batchIds: string[] };

interface StockContextValue {
  products: Produto[];
  movements: StockMovement[];
  users: StockUser[];
  addProduct: (input: NewProductInput) => string;
  updateProduct: (id: string, input: NewProductInput) => void;
  deleteProduct: (id: string) => void;
  registerEntry: (input: EntryInput) => void;
  registerExit: (input: ExitInput) => void;
  writeOffBatch: (productId: string, batchId: string) => void;
  togglePrioritized: (productId: string, batchId: string) => void;
  addUser: (user: Omit<StockUser, "id">) => void;
  updateUser: (user: StockUser) => void;
  deleteUser: (id: string) => void;
}

const StockContext = createContext<StockContextValue | null>(null);

const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StockProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Produto[]>(() => readStored("stockflow:products", initialProducts));
  const [movements, setMovements] = useState<StockMovement[]>(() => readStored("stockflow:movements", initialMovements));
  const [users, setUsers] = useState<StockUser[]>(() => readStored("stockflow:users", initialUsers));

  const persistProducts = (next: Produto[]) => { setProducts(next); localStorage.setItem("stockflow:products", JSON.stringify(next)); };
  const persistMovements = (next: StockMovement[]) => { setMovements(next); localStorage.setItem("stockflow:movements", JSON.stringify(next)); };
  const persistUsers = (next: StockUser[]) => { setUsers(next); localStorage.setItem("stockflow:users", JSON.stringify(next)); };

  const addProduct = (input: NewProductInput) => {
    const id = uid("product");
    const batches: Batch[] = input.firstBatch ? [{ ...input.firstBatch, id: uid("batch"), productId: id }] : [];
    persistProducts([...products, { id, name: input.name, barcode: input.barcode, category: input.category, unit: input.unit, minimumStock: input.minimumStock, costPrice: input.costPrice, salePrice: input.salePrice, batches }]);
    return id;
  };

  const updateProduct = (id: string, input: NewProductInput) => {
    persistProducts(products.map((product) => product.id === id ? { ...product, name: input.name, barcode: input.barcode, category: input.category, unit: input.unit, minimumStock: input.minimumStock, costPrice: input.costPrice, salePrice: input.salePrice, batches: product.batches } : product));
  };

  const deleteProduct = (id: string) => {
    persistProducts(products.filter((product) => product.id !== id));
    persistMovements(movements.filter((movement) => movement.productId !== id));
  };

  const registerEntry = (input: EntryInput) => {
    const product = products.find((item) => item.id === input.productId);
    if (!product) return;
    const batch: Batch = { id: uid("batch"), productId: product.id, code: input.batchCode, receivedAt: input.receivedAt, expiresAt: input.expiresAt, quantity: input.quantity, initialQuantity: input.quantity };
    persistProducts(products.map((item) => item.id === product.id ? { ...item, costPrice: input.unitValue, batches: [...item.batches, batch] } : item));
    persistMovements([{ id: uid("movement"), productId: product.id, productName: product.name, batchCode: batch.code, type: "Entrada", quantity: input.quantity, unitValue: input.unitValue, reason: "Entrada por nota fiscal", user: "Amanda Garcia", createdAt: new Date().toISOString() }, ...movements]);
  };

  const registerExit = (input: ExitInput) => {
    const product = products.find((item) => item.id === input.productId);
    if (!product) return;
    let remaining = input.quantity;
    const chosen = new Set(input.batchIds);
    const affected: { code: string; quantity: number }[] = [];
    const batches = product.batches.map((batch) => {
      if (!chosen.has(batch.id) || remaining <= 0) return batch;
      const taken = Math.min(batch.quantity, remaining);
      remaining -= taken;
      affected.push({ code: batch.code, quantity: taken });
      return { ...batch, quantity: batch.quantity - taken };
    });
    if (remaining > 0) return;
    persistProducts(products.map((item) => item.id === product.id ? { ...item, batches } : item));
    const additions = affected.map((item) => ({ id: uid("movement"), productId: product.id, productName: product.name, batchCode: item.code, type: "Saída" as const, quantity: item.quantity, unitValue: product.salePrice, reason: input.reason, user: "Amanda Garcia", createdAt: new Date().toISOString() }));
    persistMovements([...additions, ...movements]);
  };

  const writeOffBatch = (productId: string, batchId: string) => {
    const product = products.find((item) => item.id === productId);
    const batch = product?.batches.find((item) => item.id === batchId);
    if (!product || !batch || batch.quantity <= 0) return;
    const quantity = batch.quantity;
    persistProducts(products.map((item) => item.id === productId ? { ...item, batches: item.batches.map((candidate) => candidate.id === batchId ? { ...candidate, quantity: 0, blocked: true } : candidate) } : item));
    persistMovements([{ id: uid("movement"), productId, productName: product.name, batchCode: batch.code, type: "Baixa", quantity, unitValue: product.costPrice, reason: "Produto vencido", user: "Amanda Garcia", createdAt: new Date().toISOString() }, ...movements]);
  };

  const togglePrioritized = (productId: string, batchId: string) => {
    persistProducts(products.map((item) => item.id === productId ? { ...item, batches: item.batches.map((batch) => batch.id === batchId ? { ...batch, prioritized: !batch.prioritized } : batch) } : item));
  };

  const addUser = (user: Omit<StockUser, "id">) => persistUsers([...users, { ...user, id: uid("user") }]);
  const updateUser = (user: StockUser) => persistUsers(users.map((item) => item.id === user.id ? user : item));
  const deleteUser = (id: string) => persistUsers(users.filter((user) => user.id !== id));

  const value = { products, movements, users, addProduct, updateProduct, deleteProduct, registerEntry, registerExit, writeOffBatch, togglePrioritized, addUser, updateUser, deleteUser };
  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) throw new Error("useStock deve ser usado dentro de StockProvider");
  return context;
}

export const stockOf = getStock;
