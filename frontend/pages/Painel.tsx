import { HiOutlineArrowTrendingUp, HiOutlineExclamationTriangle } from "react-icons/hi2";
import RelatorioAtual from "../Components/RelatorioAtual";
import { useStock } from "../context/StockContext";
import { formatCurrency, formatDateTime, getBatchState, getStock } from "../utils/stock";

function Painel() {
  const { products, movements } = useStock();
  const expiring = products.flatMap((product) => product.batches).filter((batch) => ["expired", "expiring"].includes(getBatchState(batch.expiresAt, batch.blocked).type));
  const totalValue = products.reduce((total, product) => total + getStock(product) * product.costPrice, 0);
  const recent = movements.slice(0, 6);
  const maxQuantity = Math.max(...recent.map((movement) => movement.quantity), 1);

  return (
    <div className="page-shell">
      <header className="page-header"><div><h1 className="page-title">Painel de estoque</h1><span className="page-subtitle">Visão geral da operação e alertas prioritários.</span></div><time className="rounded-md border border-[#ded7ca] bg-branco px-3 py-2 text-xs text-pretoClaro">24/10/2026 · 14:20</time></header>
      <div className="mb-5 flex items-center gap-3 rounded-lg border border-[#ebd69d] bg-[#f8e9c4] px-4 py-3 text-sm font-semibold text-[#8e621b]"><HiOutlineExclamationTriangle className="text-lg" />{expiring.length} lotes vencidos ou próximos do vencimento precisam de atenção.</div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)]">
        <RelatorioAtual products={products} />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="card p-5"><span className="text-xs font-semibold uppercase tracking-wide text-pretoClaro">Preço total do estoque</span><strong className="brand-font mt-2 block text-3xl text-verdeEscuro">{formatCurrency(totalValue)}</strong><div className="mt-6 flex h-16 items-end gap-2">{[28, 40, 36, 52, 46, 68, 58, 82].map((height, index) => <i key={index} className={`flex-1 rounded-t-sm ${index === 7 ? "bg-[#b95732]" : "bg-[#e0d8c9]"}`} style={{ height: `${height}%` }} />)}</div><div className="mt-2 flex justify-between text-[9px] text-pretoClaro"><span>17 out</span><span>24 out</span></div></section>
          <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] px-5 py-4"><h2 className="section-title">Movimentos de hoje</h2></div><div className="max-h-[330px] overflow-auto px-5">{recent.map((movement) => <div key={movement.id} className="grid grid-cols-[40px_30px_1fr] gap-2 border-b border-[#eee8dd] py-3 text-[11px] last:border-0"><time className="text-pretoClaro">{formatDateTime(movement.createdAt).split(" ").at(-1)}</time><strong className={movement.type === "Entrada" ? "text-[#388052]" : "text-vermelhoEscuro"}>{movement.type === "Entrada" ? "+" : "-"}{movement.quantity}</strong><span className="truncate">{movement.productName}</span></div>)}</div></section>
        </div>
      </div>
      <section className="card mt-5 p-5">
        <div className="mb-5 flex items-center justify-between"><h2 className="section-title">Volume das últimas movimentações</h2><HiOutlineArrowTrendingUp className="text-verdeClaro" /></div>
        <div className="flex h-24 items-end gap-3">{recent.toReversed().map((movement) => <div key={movement.id} className="flex flex-1 flex-col items-center gap-2"><div className={`w-full max-w-16 rounded-t ${movement.type === "Entrada" ? "bg-[#7fa787]" : "bg-[#d49a82]"}`} style={{ height: `${Math.max(10, movement.quantity / maxQuantity * 72)}px` }} /><span className="hidden text-[9px] text-pretoClaro sm:block">{movement.productName.split(" ")[0]}</span></div>)}</div>
      </section>
    </div>
  );
}

export default Painel;
