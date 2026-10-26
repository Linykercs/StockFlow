import { useMemo, useState, type FormEvent } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Toast from "../Components/Toast";
import { useStock } from "../context/StockContext";
import { mensagemDeErro } from "../services/api";
import type { Batch, ExitReason } from "../types/Produto";
import { formatDate, getAvailableStock, getBatchState, unitLabel } from "../utils/stock";

// RN02: lote vencido ou baixado não aparece para venda; ele sai pela baixa na tela de lotes
const lotesDisponiveis = (batches: Batch[]) =>
  batches.filter((batch) => batch.quantity > 0 && !["blocked", "expired"].includes(getBatchState(batch.expiresAt, batch.blocked).type))
    .toSorted((a, b) => (a.expiresAt || "9999").localeCompare(b.expiresAt || "9999"));

const motivos: { value: ExitReason; label: string }[] = [
  { value: "VENDA", label: "Venda / reposição de gôndola" },
  { value: "PERDA", label: "Avaria / perda" },
  { value: "AJUSTE", label: "Ajuste de estoque" },
];

function Saida() {
  const navigate = useNavigate();
  const { products, registerExit } = useStock();
  const availableProducts = products.filter((item) => getAvailableStock(item) > 0);
  const [productId, setProductId] = useState(availableProducts[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<ExitReason>("VENDA");
  const [selectedBatches, setSelectedBatches] = useState<string[]>(() => {
    const firstBatch = lotesDisponiveis(availableProducts[0]?.batches ?? [])[0];
    return firstBatch ? [firstBatch.id] : [];
  });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const product = products.find((item) => item.id === productId);
  const unit = product ? unitLabel[product.unit] : "";
  const batches = useMemo(() => lotesDisponiveis(product?.batches ?? []), [product]);
  const selectedQuantity = batches.filter((batch) => selectedBatches.includes(batch.id)).reduce((sum, batch) => sum + batch.quantity, 0);
  const requested = Number(quantity) || 0;
  const stock = product ? getAvailableStock(product) : 0;
  const valid = requested > 0 && requested <= stock && selectedQuantity >= requested;

  const changeProduct = (id: string) => {
    setProductId(id);
    const firstBatch = lotesDisponiveis(products.find((item) => item.id === id)?.batches ?? [])[0];
    setSelectedBatches(firstBatch ? [firstBatch.id] : []);
  };
  const toggle = (id: string) => setSelectedBatches((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) { setError("Selecione lotes com saldo suficiente para atender a saída."); return; }
    setSending(true);
    try {
      await registerExit({ productId, quantity: requested, reason, batchIds: selectedBatches });
      setError(""); setToast("Saída registrada com sucesso."); setQuantity("");
    } catch (erro) {
      setError(mensagemDeErro(erro));
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="page-shell" onSubmit={submit}>
      <header className="page-header"><div><h1 className="page-title">Registrar movimentação</h1><span className="page-subtitle">Baixa de estoque por saída</span></div><div className="flex gap-2"><button type="button" className="btn btn-secondary" onClick={() => navigate("/entrada")}>Entrada</button><button type="button" className="btn btn-primary">Saída</button></div></header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="grid gap-5">
          <section className="card p-5">
            <h2 className="section-title mb-5">Dados da saída</h2>
            <div className="field mb-5"><label htmlFor="product">Produto</label><select id="product" className="control" value={productId} onChange={(event) => changeProduct(event.target.value)}>{availableProducts.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.barcode || item.code}</option>)}</select></div>
            <div className="grid gap-5 sm:grid-cols-2"><div className="field"><label htmlFor="quantity">Quantidade de saída ({unit})</label><input id="quantity" className={`control ${requested > stock ? "border-red-500" : ""}`} type="number" min="0" step={product?.unit === "UNIDADE" ? "1" : "any"} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div><div className="field"><label htmlFor="reason">Motivo</label><select id="reason" className="control" value={reason} onChange={(event) => setReason(event.target.value as ExitReason)}>{motivos.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div></div>
            {requested > stock && <div className="mt-4 flex gap-2 rounded-lg bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro"><HiOutlineExclamationTriangle className="text-lg" /><span><strong>Saída bloqueada · estoque insuficiente.</strong><br />A quantidade solicitada ({requested} {unit}) é maior que a disponível ({stock} {unit}).</span></div>}
          </section>
          <section className="card p-5"><h2 className="section-title mb-4">Selecione o lote de saída</h2><div className="grid gap-3">{batches.map((batch) => { const state = getBatchState(batch.expiresAt, batch.blocked); return <label key={batch.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${selectedBatches.includes(batch.id) ? "border-verdeClaro bg-[#f0f3ec]" : "border-[#e3dccf] bg-[#faf7f0]"}`}><input type="checkbox" className="h-4 w-4 accent-verdeEscuro" checked={selectedBatches.includes(batch.id)} onChange={() => toggle(batch.id)} /><span className="min-w-0 flex-1"><strong className="block text-sm">Lote {batch.code}</strong><small className="text-pretoClaro">Validade {formatDate(batch.expiresAt)} · {batch.quantity} {unit}</small></span>{state.type === "expiring" && <span className="badge badge-orange">{state.label}</span>}{batch.prioritized && <span className="badge badge-red">Prioridade</span>}</label>; })}{!batches.length && <p className="text-sm text-pretoClaro">Este produto não possui lotes disponíveis.</p>}</div></section>
        </div>
        <aside className="card self-start p-5"><h2 className="section-title mb-5">Resumo do estoque</h2><dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Disponível para saída</dt><dd className="font-semibold">{stock} {unit}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Saída solicitada</dt><dd className="font-semibold text-vermelhoEscuro">-{requested} {unit}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Saldo dos lotes</dt><dd className="font-semibold text-[#96671a]">{selectedQuantity} {unit}</dd></div><div className="flex justify-between border-t border-[#eee8dd] pt-3"><dt className="text-pretoClaro">Novo estoque</dt><dd className="font-semibold">{Math.max(0, stock - requested)} {unit}</dd></div></dl>{error && <p className="mt-4 rounded-md bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro">{error}</p>}<button className="btn btn-primary mt-5 w-full" disabled={!valid || sending}>{sending ? "Registrando..." : "Confirmar saída"}</button></aside>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </form>
  );
}

export default Saida;
