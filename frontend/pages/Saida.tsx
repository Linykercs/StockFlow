import { useMemo, useState, type FormEvent } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Toast from "../Components/Toast";
import { useStock } from "../context/StockContext";
import { formatDate, getBatchState, getStock } from "../utils/stock";

function Saida() {
  const navigate = useNavigate();
  const { products, registerExit } = useStock();
  const availableProducts = products.filter((item) => getStock(item) > 0);
  const [productId, setProductId] = useState(availableProducts[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("Venda / reposição de gôndola");
  const [selectedBatches, setSelectedBatches] = useState<string[]>(() => {
    const firstProduct = availableProducts[0];
    const firstBatch = firstProduct?.batches.filter((batch) => batch.quantity > 0 && !batch.blocked).toSorted((a, b) => a.expiresAt.localeCompare(b.expiresAt))[0];
    return firstBatch ? [firstBatch.id] : [];
  });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const product = products.find((item) => item.id === productId);
  const batches = useMemo(() => (product?.batches ?? []).filter((batch) => batch.quantity > 0 && !batch.blocked).toSorted((a, b) => a.expiresAt.localeCompare(b.expiresAt)), [product]);
  const selectedQuantity = batches.filter((batch) => selectedBatches.includes(batch.id)).reduce((sum, batch) => sum + batch.quantity, 0);
  const requested = Number(quantity) || 0;
  const stock = product ? getStock(product) : 0;
  const valid = requested > 0 && requested <= stock && selectedQuantity >= requested;

  const changeProduct = (id: string) => {
    setProductId(id);
    const nextProduct = products.find((item) => item.id === id);
    const firstBatch = nextProduct?.batches.filter((batch) => batch.quantity > 0 && !batch.blocked).toSorted((a, b) => a.expiresAt.localeCompare(b.expiresAt))[0];
    setSelectedBatches(firstBatch ? [firstBatch.id] : []);
  };
  const toggle = (id: string) => setSelectedBatches((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!valid) { setError("Selecione lotes com saldo suficiente para atender a saída."); return; } registerExit({ productId, quantity: requested, reason, batchIds: selectedBatches }); setError(""); setToast("Saída registrada com sucesso."); setQuantity(""); };

  return (
    <form className="page-shell" onSubmit={submit}>
      <header className="page-header"><div><h1 className="page-title">Registrar movimentação</h1><span className="page-subtitle">Baixa de estoque por saída</span></div><div className="flex gap-2"><button type="button" className="btn btn-secondary" onClick={() => navigate("/entrada")}>Entrada</button><button type="button" className="btn btn-primary">Saída</button></div></header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="grid gap-5">
          <section className="card p-5">
            <h2 className="section-title mb-5">Dados da saída</h2>
            <div className="field mb-5"><label htmlFor="product">Produto</label><select id="product" className="control" value={productId} onChange={(event) => changeProduct(event.target.value)}>{availableProducts.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.barcode}</option>)}</select></div>
            <div className="grid gap-5 sm:grid-cols-2"><div className="field"><label htmlFor="quantity">Quantidade de saída</label><input id="quantity" className={`control ${requested > stock ? "border-red-500" : ""}`} type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div><div className="field"><label htmlFor="reason">Motivo</label><select id="reason" className="control" value={reason} onChange={(event) => setReason(event.target.value)}><option>Venda / reposição de gôndola</option><option>Avaria</option><option>Uso interno</option><option>Transferência</option></select></div></div>
            {requested > stock && <div className="mt-4 flex gap-2 rounded-lg bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro"><HiOutlineExclamationTriangle className="text-lg" /><span><strong>Saída bloqueada · estoque insuficiente.</strong><br />A quantidade solicitada ({requested} un.) é maior que a disponível ({stock} un.).</span></div>}
          </section>
          <section className="card p-5"><h2 className="section-title mb-4">Selecione o lote de saída</h2><div className="grid gap-3">{batches.map((batch) => { const state = getBatchState(batch.expiresAt, batch.blocked); return <label key={batch.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${selectedBatches.includes(batch.id) ? "border-verdeClaro bg-[#f0f3ec]" : "border-[#e3dccf] bg-[#faf7f0]"}`}><input type="checkbox" className="h-4 w-4 accent-verdeEscuro" checked={selectedBatches.includes(batch.id)} onChange={() => toggle(batch.id)} /><span className="min-w-0 flex-1"><strong className="block text-sm">Lote {batch.code}</strong><small className="text-pretoClaro">Validade {formatDate(batch.expiresAt)} · {batch.quantity} un.</small></span>{state.type === "expiring" && <span className="badge badge-orange">{state.label}</span>}{batch.prioritized && <span className="badge badge-red">Prioridade</span>}</label>; })}{!batches.length && <p className="text-sm text-pretoClaro">Este produto não possui lotes disponíveis.</p>}</div></section>
        </div>
        <aside className="card self-start p-5"><h2 className="section-title mb-5">Resumo do estoque</h2><dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Estoque atual</dt><dd className="font-semibold">{stock} un.</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Saída solicitada</dt><dd className="font-semibold text-vermelhoEscuro">-{requested} un.</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Saldo dos lotes</dt><dd className="font-semibold text-[#96671a]">{selectedQuantity} un.</dd></div><div className="flex justify-between border-t border-[#eee8dd] pt-3"><dt className="text-pretoClaro">Novo estoque</dt><dd className="font-semibold">{Math.max(0, stock - requested)} un.</dd></div></dl>{error && <p className="mt-4 rounded-md bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro">{error}</p>}<button className="btn btn-primary mt-5 w-full" disabled={!valid}>Confirmar saída</button></aside>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </form>
  );
}

export default Saida;
