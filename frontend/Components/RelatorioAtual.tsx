import { useNavigate } from "react-router-dom";
import type { Produto } from "../types/Produto";
import { getBatchState, getProductStatus, getStock } from "../utils/stock";

export default function RelatorioAtual({ products }: { products: Produto[] }) {
  const navigate = useNavigate();
  const rows = products.flatMap((product) => {
    const urgentBatch = product.batches.map((batch) => ({ batch, state: getBatchState(batch.expiresAt, batch.blocked) })).find(({ state }) => state.type === "expired" || state.type === "expiring");
    const status = getProductStatus(product);
    if (!urgentBatch && status === "Em estoque") return [];
    const type = urgentBatch?.state.type ?? "minimum";
    const label = urgentBatch?.state.label ?? status;
    return [{ product, batch: urgentBatch?.batch, type, label }];
  }).slice(0, 8);

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#eee8dd] px-5 py-4"><h2 className="section-title">Relatório atual</h2><span className="text-xs text-pretoClaro">{rows.length} itens</span></div>
      {rows.map(({ product, batch, type, label }) => (
        <div key={product.id} className="grid grid-cols-[minmax(0,1.4fr)_80px_minmax(110px,1fr)_65px_110px] items-center gap-2 border-b border-[#eee8dd] px-5 py-3 text-xs last:border-b-0">
          <strong className="truncate font-semibold">{product.name}</strong><span className="text-pretoClaro">{batch?.code ?? "—"}</span>
          <span className={`font-semibold ${type === "expired" || type === "blocked" ? "text-vermelhoEscuro" : type === "expiring" ? "text-[#a3572d]" : "text-[#91601b]"}`}>{label}</span>
          <span>{getStock(product)} un.</span>
          <button className={`badge justify-center ${type === "expired" || type === "blocked" ? "badge-red" : type === "expiring" ? "badge-orange" : "badge-yellow"}`} onClick={() => navigate(type === "minimum" ? "/entrada" : "/lotes")}>{type === "expired" || type === "blocked" ? "Dar baixa" : type === "expiring" ? "Priorizar venda" : "Repor"}</button>
        </div>
      ))}
      {!rows.length && <div className="empty-state min-h-[160px]">Estoque sem alertas no momento.</div>}
    </section>
  );
}
