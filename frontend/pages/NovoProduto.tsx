import { useState, type FormEvent } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../Components/ConfirmModal";
import { useStock } from "../context/StockContext";
import { mensagemDeErro } from "../services/api";
import type { NewProductInput, Unit } from "../types/Produto";
import { formatDate } from "../utils/stock";

const today = new Date().toISOString().slice(0, 10);
const emptyForm = { code: "", name: "", barcode: "", categoryId: "", unit: "UNIDADE" as Unit, minimumStock: "", costPrice: "", salePrice: "", batchCode: "", expiresAt: "", quantity: "" };

function NovoProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStock();
  const current = products.find((product) => product.id === id);
  const editing = Boolean(id);
  const [form, setForm] = useState(() => current ? { code: current.code, name: current.name, barcode: current.barcode, categoryId: current.categoryId ? String(current.categoryId) : "", unit: current.unit, minimumStock: String(current.minimumStock), costPrice: String(current.costPrice), salePrice: String(current.salePrice), batchCode: "", expiresAt: "", quantity: "" } : emptyForm);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (field: keyof typeof form, value: string) => setForm((state) => ({ ...state, [field]: value }));
  const variation = Number(form.costPrice) > 0 && Number(form.salePrice) > 0 ? ((Number(form.salePrice) / Number(form.costPrice) - 1) * 100).toFixed(1) : "0.0";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.minimumStock || !form.costPrice || !form.salePrice) { setError("Preencha os dados obrigatórios do produto."); return; }
    if (!editing && (!form.batchCode || !form.expiresAt || !form.quantity)) { setError("Preencha todos os dados do primeiro lote."); return; }
    const payload: NewProductInput = {
      code: form.code, name: form.name, barcode: form.barcode, categoryId: form.categoryId ? Number(form.categoryId) : null, unit: form.unit,
      minimumStock: Number(form.minimumStock), costPrice: Number(form.costPrice), salePrice: Number(form.salePrice),
      firstBatch: !editing ? { code: form.batchCode.trim(), expiresAt: form.expiresAt, quantity: Number(form.quantity) } : undefined,
    };
    setSending(true);
    try {
      if (editing && id) await updateProduct(id, payload); else await addProduct(payload);
      navigate("/produtos", { state: { message: editing ? "Produto atualizado." : "Produto cadastrado." } });
    } catch (erro) {
      setError(mensagemDeErro(erro));
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    try {
      await deleteProduct(id);
      navigate("/produtos");
    } catch (erro) {
      setConfirmDelete(false);
      setError(mensagemDeErro(erro));
    }
  };

  if (editing && !current) return <div className="page-shell"><div className="empty-state"><div><h1 className="page-title">Produto não encontrado</h1><button className="btn btn-primary mt-5" onClick={() => navigate("/produtos")}>Voltar aos produtos</button></div></div></div>;

  return (
    <form className="page-shell" onSubmit={submit}>
      <header className="page-header"><div><h1 className="page-title">{editing ? "Editar produto" : "Novo produto"}</h1><span className="page-subtitle">{editing ? "Atualize os dados cadastrais e valores." : "Cadastre o item e seu primeiro lote."}</span></div></header>
      {error && <div className="mb-5 rounded-lg border border-[#ecc8be] bg-vermelhoClaro p-3 text-sm text-vermelhoEscuro">{error}</div>}
      <div className={`grid gap-5 ${editing ? "xl:grid-cols-1" : "xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"}`}>
        <section className="card p-5">
          <h2 className="section-title mb-5">Dados do produto</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="field sm:col-span-2"><label htmlFor="name">Nome do produto *</label><input id="name" className="control" value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="Ex.: Arroz Tio Prato Fino 5kg" /></div>
            <div className="field"><label htmlFor="code">Código interno *</label><input id="code" className="control" value={form.code} onChange={(event) => set("code", event.target.value)} placeholder="Ex.: P010" /></div>
            <div className="field"><label htmlFor="barcode">Código de barras</label><input id="barcode" className="control" inputMode="numeric" value={form.barcode} onChange={(event) => set("barcode", event.target.value)} placeholder="8 a 14 números" /></div>
            <div className="field"><label htmlFor="category">Categoria</label><select id="category" className="control" value={form.categoryId} onChange={(event) => set("categoryId", event.target.value)}><option value="">Sem categoria</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
            <div className="field"><label htmlFor="unit">Unidade de medida *</label><select id="unit" className="control" value={form.unit} onChange={(event) => set("unit", event.target.value as Unit)}><option value="UNIDADE">Unidade</option><option value="KG">Quilo (kg)</option><option value="LITRO">Litro (L)</option></select></div>
            <div className="field"><label htmlFor="minimum">Estoque mínimo *</label><input id="minimum" className="control" type="number" min="0" step="any" value={form.minimumStock} onChange={(event) => set("minimumStock", event.target.value)} /></div>
          </div>
        </section>
        {!editing && <section className="card p-5">
          <h2 className="section-title mb-5">Primeiro lote</h2>
          <div className="grid gap-4">
            <div className="field"><label htmlFor="batch">Número do lote *</label><input id="batch" className="control" value={form.batchCode} onChange={(event) => set("batchCode", event.target.value)} placeholder="L-2410" /></div>
            <div className="field"><label>Data de recebimento</label><output className="control flex items-center bg-[#f7f3eb]">{formatDate(today)} (hoje)</output></div>
            <div className="field"><label htmlFor="expires">Data de validade *</label><input id="expires" className="control" type="date" min={today} value={form.expiresAt} onChange={(event) => set("expiresAt", event.target.value)} /></div>
            <div className="field"><label htmlFor="quantity">Quantidade recebida *</label><input id="quantity" className="control" type="number" min="0" step={form.unit === "UNIDADE" ? "1" : "any"} value={form.quantity} onChange={(event) => set("quantity", event.target.value)} /></div>
          </div>
        </section>}
      </div>
      <section className="card mt-5 max-w-3xl p-5">
        <h2 className="section-title mb-5">Valores</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="field"><label htmlFor="cost">Valor de entrada *</label><input id="cost" className="control" type="number" min="0" step="0.01" value={form.costPrice} onChange={(event) => set("costPrice", event.target.value)} /></div>
          <div className="field"><label>Variação</label><output className="control flex items-center bg-[#f7f3eb]">+{variation}%</output></div>
          <div className="field"><label htmlFor="sale">Valor de saída *</label><input id="sale" className="control" type="number" min="0" step="0.01" value={form.salePrice} onChange={(event) => set("salePrice", event.target.value)} /></div>
        </div>
        {editing && <p className="mt-4 text-xs text-pretoClaro">Mudança de preço fica registrada no histórico com o seu usuário.</p>}
      </section>
      <footer className="mt-8 flex flex-wrap justify-end gap-3">
        {editing && <button type="button" className="btn btn-danger mr-auto" onClick={() => setConfirmDelete(true)}><HiOutlineTrash /> Excluir produto</button>}
        <button type="button" className="btn btn-secondary" onClick={() => navigate("/produtos")}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? "Salvando..." : editing ? "Salvar alterações" : "Salvar produto"}</button>
      </footer>
      <ConfirmModal open={confirmDelete} title="Excluir este produto?" confirmLabel="Excluir produto" onClose={() => setConfirmDelete(false)} onConfirm={remove} description={<>O produto será retirado da busca. Lotes e movimentações dele continuam no histórico e nos relatórios.<small className="mt-3 block">Somente administrador e gerente podem excluir produtos.</small></>} />
    </form>
  );
}

export default NovoProduto;
