import { useState, type FormEvent } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../Components/ConfirmModal";
import { useStock } from "../context/StockContext";
import type { NewProductInput, Unit } from "../types/Produto";

const today = new Date().toISOString().slice(0, 10);
const emptyForm = { name: "", barcode: "", category: "Mercearia", unit: "PCT" as Unit, minimumStock: "", costPrice: "", salePrice: "", batchCode: "", receivedAt: today, expiresAt: "", quantity: "" };

function NovoProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useStock();
  const current = products.find((product) => product.id === id);
  const editing = Boolean(id);
  const [form, setForm] = useState(() => current ? { name: current.name, barcode: current.barcode, category: current.category, unit: current.unit, minimumStock: String(current.minimumStock), costPrice: String(current.costPrice), salePrice: String(current.salePrice), batchCode: "", receivedAt: today, expiresAt: "", quantity: "" } : emptyForm);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (field: keyof typeof form, value: string) => setForm((state) => ({ ...state, [field]: value }));
  const variation = Number(form.costPrice) > 0 && Number(form.salePrice) > 0 ? ((Number(form.salePrice) / Number(form.costPrice) - 1) * 100).toFixed(1) : "0.0";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.barcode.trim() || !form.minimumStock || !form.costPrice || !form.salePrice) { setError("Preencha os dados obrigatórios do produto."); return; }
    if (!editing && (!form.batchCode || !form.expiresAt || !form.quantity)) { setError("Preencha todos os dados do primeiro lote."); return; }
    const payload: NewProductInput = {
      name: form.name.trim(), barcode: form.barcode.trim(), category: form.category, unit: form.unit, minimumStock: Number(form.minimumStock), costPrice: Number(form.costPrice), salePrice: Number(form.salePrice),
      firstBatch: !editing ? { code: form.batchCode, receivedAt: form.receivedAt, expiresAt: form.expiresAt, quantity: Number(form.quantity), initialQuantity: Number(form.quantity) } : undefined,
    };
    if (editing && id) updateProduct(id, payload); else addProduct(payload);
    navigate("/produtos", { state: { message: editing ? "Produto atualizado." : "Produto cadastrado." } });
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
            <div className="field"><label htmlFor="barcode">Código de barras *</label><input id="barcode" className="control" inputMode="numeric" value={form.barcode} onChange={(event) => set("barcode", event.target.value)} /></div>
            <div className="field"><label htmlFor="category">Categoria *</label><select id="category" className="control" value={form.category} onChange={(event) => set("category", event.target.value)}><option>Mercearia</option><option>Bebidas</option><option>Limpeza</option><option>Higiene</option><option>Laticínios</option><option>Frios</option><option>Hortifrúti</option></select></div>
            <div className="field"><label htmlFor="unit">Unidade de medida *</label><select id="unit" className="control" value={form.unit} onChange={(event) => set("unit", event.target.value as Unit)}><option>PCT</option><option>UN</option><option>KG</option><option>L</option><option>CX</option></select></div>
            <div className="field"><label htmlFor="minimum">Estoque mínimo *</label><input id="minimum" className="control" type="number" min="0" value={form.minimumStock} onChange={(event) => set("minimumStock", event.target.value)} /></div>
          </div>
        </section>
        {!editing && <section className="card p-5">
          <h2 className="section-title mb-5">Primeiro lote</h2>
          <div className="grid gap-4">
            <div className="field"><label htmlFor="batch">Número do lote *</label><input id="batch" className="control" value={form.batchCode} onChange={(event) => set("batchCode", event.target.value)} placeholder="L-2410" /></div>
            <div className="field"><label htmlFor="received">Data de recebimento *</label><input id="received" className="control" type="date" value={form.receivedAt} onChange={(event) => set("receivedAt", event.target.value)} /></div>
            <div className="field"><label htmlFor="expires">Data de validade *</label><input id="expires" className="control" type="date" value={form.expiresAt} onChange={(event) => set("expiresAt", event.target.value)} /></div>
            <div className="field"><label htmlFor="quantity">Quantidade recebida *</label><input id="quantity" className="control" type="number" min="1" value={form.quantity} onChange={(event) => set("quantity", event.target.value)} /></div>
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
      </section>
      <footer className="mt-8 flex flex-wrap justify-end gap-3">
        {editing && <button type="button" className="btn btn-danger mr-auto" onClick={() => setConfirmDelete(true)}><HiOutlineTrash /> Excluir produto</button>}
        <button type="button" className="btn btn-secondary" onClick={() => navigate("/produtos")}>Cancelar</button>
        <button type="submit" className="btn btn-primary">{editing ? "Salvar alterações" : "Salvar produto"}</button>
      </footer>
      <ConfirmModal open={confirmDelete} title="Excluir este produto?" confirmLabel="Excluir produto" onClose={() => setConfirmDelete(false)} onConfirm={() => { if (id) deleteProduct(id); navigate("/produtos"); }} description={<>O produto será retirado da busca. Lotes, movimentações e relatórios relacionados também poderão ser removidos.<small className="mt-3 block">Somente o administrador pode excluir produtos.</small></>} />
    </form>
  );
}

export default NovoProduto;
