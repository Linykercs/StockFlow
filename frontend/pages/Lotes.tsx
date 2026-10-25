import { useMemo, useState } from "react";
import { HiOutlineEye } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../Components/ConfirmModal";
import Toast from "../Components/Toast";
import { useStock } from "../context/StockContext";
import type { Batch, Produto } from "../types/Produto";
import { mensagemDeErro } from "../services/api";
import { formatCurrency, formatDate, getBatchState, unitLabel } from "../utils/stock";

type BatchRow = { product: Produto; batch: Batch };

function Lotes() {
  const navigate = useNavigate();
  const { products, writeOffBatch, togglePrioritized } = useStock();
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState<BatchRow | null>(null);
  const [writeOff, setWriteOff] = useState<BatchRow | null>(null);
  const [toast, setToast] = useState("");
  const rows = useMemo(() => products.flatMap((product) => product.batches.map((batch) => ({ product, batch }))).toSorted((a, b) => a.batch.expiresAt.localeCompare(b.batch.expiresAt)), [products]);
  const expiring = rows.filter(({ batch }) => getBatchState(batch.expiresAt, batch.blocked).type === "expiring").length;
  const expired = rows.filter(({ batch }) => getBatchState(batch.expiresAt, batch.blocked).type === "expired").length;
  const blocked = rows.filter(({ batch }) => getBatchState(batch.expiresAt, batch.blocked).type === "blocked").length;
  const risk = rows.filter(({ batch }) => ["expired", "expiring", "blocked"].includes(getBatchState(batch.expiresAt, batch.blocked).type)).reduce((sum, { product, batch }) => sum + (batch.costPrice || product.costPrice) * batch.quantity, 0);
  const filtered = rows.filter(({ batch }) => { const state = getBatchState(batch.expiresAt, batch.blocked).type; return filter === "Todos" || (filter === "Vencendo em 7 dias" && state === "expiring") || (filter === "Vencidos" && state === "expired") || (filter === "Baixados" && state === "blocked"); });

  const confirmWriteOff = async () => {
    if (!writeOff) return;
    try {
      await writeOffBatch(writeOff.product.id, writeOff.batch.id);
      setToast("Baixa registrada e lote descartado.");
    } catch (erro) {
      setToast(mensagemDeErro(erro));
    }
    setWriteOff(null);
  };

  return (
    <div className="page-shell">
      <header className="page-header"><div><h1 className="page-title">Lotes e validade</h1><span className="page-subtitle">{rows.filter(({ batch }) => !batch.blocked).length} lotes ativos</span></div><button className="btn btn-primary" onClick={() => navigate("/entrada")}>+ Novo lote</button></header>
      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Lotes ativos", value: rows.filter(({ batch }) => batch.quantity > 0).length, tone: "text-verdeEscuro" }, { label: "Vencendo em 7 dias", value: expiring, tone: "text-[#b0642f]" }, { label: "Vencidos e baixados", value: expired + blocked, tone: "text-vermelhoEscuro" }, { label: "Valor em risco", value: formatCurrency(risk), tone: "text-[#96671a]" }].map((card) => <div key={card.label} className="card p-4"><span className="text-xs text-pretoClaro">{card.label}</span><strong className={`brand-font mt-1 block text-2xl ${card.tone}`}>{card.value}</strong></div>)}
      </section>
      <div className="mb-4 flex flex-wrap gap-2">{["Todos", "Vencendo em 7 dias", "Vencidos", "Baixados"].map((item) => <button key={item} className={`btn ${filter === item ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="table-wrap max-h-[calc(100vh-290px)]"><table className="data-table"><thead><tr><th>Lote</th><th>Produto</th><th>Recebimento</th><th>Validade</th><th>Quantidade</th><th>Status</th><th>Ação</th></tr></thead><tbody>{filtered.map(({ product, batch }) => { const state = getBatchState(batch.expiresAt, batch.blocked); const badge = state.type === "valid" ? "badge-green" : state.type === "expiring" ? "badge-orange" : "badge-red"; return <tr key={batch.id}><td className="font-semibold">{batch.code}</td><td>{product.name}</td><td>{formatDate(batch.receivedAt)}</td><td>{formatDate(batch.expiresAt)}</td><td>{batch.quantity} {unitLabel[product.unit]}</td><td><span className={`badge ${badge}`}>{state.label}</span></td><td><div className="flex flex-wrap gap-2">{(state.type === "expired" || state.type === "blocked") && batch.quantity > 0 && <button className="btn btn-danger min-h-8 px-3" onClick={() => setWriteOff({ product, batch })}>Dar baixa</button>}{state.type === "expiring" && <button className={`btn min-h-8 px-3 ${batch.prioritized ? "btn-primary" : "btn-secondary"}`} onClick={() => { togglePrioritized(product.id, batch.id); setToast(batch.prioritized ? "Prioridade removida." : "Lote marcado como prioridade de venda."); }}>{batch.prioritized ? "Priorizado" : "Priorizar venda"}</button>}<button className="btn btn-secondary min-h-8 px-3" onClick={() => setSelected({ product, batch })}><HiOutlineEye /> Ver</button></div></td></tr>; })}</tbody></table>{!filtered.length && <div className="empty-state">Nenhum lote nessa situação.</div>}</div>

      {selected && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><section className="modal"><div className="mb-5 flex items-start justify-between"><div><span className="text-xs uppercase text-pretoClaro">Detalhes do lote</span><h2 className="page-title mt-1">{selected.batch.code}</h2></div><button className="btn btn-ghost icon-btn" onClick={() => setSelected(null)}>✕</button></div><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-pretoClaro">Produto</dt><dd className="font-semibold">{selected.product.name}</dd></div><div><dt className="text-pretoClaro">Quantidade atual</dt><dd className="font-semibold">{selected.batch.quantity} {unitLabel[selected.product.unit]}</dd></div><div><dt className="text-pretoClaro">Recebido em</dt><dd>{formatDate(selected.batch.receivedAt)}</dd></div><div><dt className="text-pretoClaro">Validade</dt><dd>{formatDate(selected.batch.expiresAt)}</dd></div><div><dt className="text-pretoClaro">Valor do lote</dt><dd>{formatCurrency(selected.batch.quantity * (selected.batch.costPrice || selected.product.costPrice))}</dd></div><div><dt className="text-pretoClaro">Situação</dt><dd>{getBatchState(selected.batch.expiresAt, selected.batch.blocked).label}</dd></div></dl><button className="btn btn-secondary mt-7 w-full" onClick={() => setSelected(null)}>Fechar</button></section></div>}
      <ConfirmModal open={Boolean(writeOff)} title="Dar baixa neste lote?" confirmLabel="Registrar baixa" onClose={() => setWriteOff(null)} onConfirm={confirmWriteOff} description={<>Todo o saldo do lote <strong>{writeOff?.batch.code}</strong> ({writeOff?.batch.quantity} {writeOff ? unitLabel[writeOff.product.unit] : ""}) será retirado do estoque, o lote será descartado e uma movimentação de baixa será criada.</>} />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

export default Lotes;
