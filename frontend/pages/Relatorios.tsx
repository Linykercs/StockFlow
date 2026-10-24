import { useMemo, useState } from "react";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import { useStock } from "../context/StockContext";
import { daysUntil, formatCurrency, getBatchState, getStock } from "../utils/stock";

const tabs = ["Estoque atual", "Movimentações", "Perdas", "Vencimentos", "Variação de valores"];

function Relatorios() {
  const { products, movements } = useStock();
  const [tab, setTab] = useState("Perdas");
  const [category, setCategory] = useState("Todas");
  const [period, setPeriod] = useState("01/05/2026 a 24/10/2026");
  const [generatedAt, setGeneratedAt] = useState(new Date());
  const losses = useMemo(() => movements.filter((item) => item.type === "Baixa" && (category === "Todas" || products.find((product) => product.id === item.productId)?.category === category)), [movements, products, category]);
  const months = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"];
  const values = [3120, 2780, 2950, 2260, 2070, losses.reduce((sum, item) => sum + item.quantity * item.unitValue, 0) || 1940];
  const max = Math.max(...values);
  const categories = [...new Set(products.map((product) => product.category))];

  const mainContent = () => {
    if (tab === "Perdas") return <><section className="card p-5"><div className="mb-6 flex items-center justify-between"><h2 className="section-title">Perdas por validade · últimos 6 meses</h2><span className="text-xs text-pretoClaro">Média {formatCurrency(values.reduce((a, b) => a + b, 0) / values.length)}/mês</span></div><div className="flex h-52 items-end gap-5 border-b border-[#dcd4c7] px-2">{values.map((value, index) => <div key={months[index]} className="flex h-full flex-1 flex-col justify-end gap-2 text-center"><span className="text-[10px] text-pretoClaro">{formatCurrency(value)}</span><div className={`mx-auto w-full max-w-20 rounded-t ${index === values.length - 1 ? "bg-verdeEscuro" : "bg-[#a9c59f]"}`} style={{ height: `${Math.max(16, value / max * 78)}%` }} /><span className="pb-2 text-xs text-pretoClaro">{months[index]}</span></div>)}</div></section><section className="card mt-5 overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Detalhamento das perdas do mês</h2></div>{losses.map((item) => <div className="flex items-center justify-between border-b border-[#eee8dd] px-5 py-4 text-sm last:border-0" key={item.id}><div><strong className="block">{item.productName}</strong><small className="text-pretoClaro">Lote {item.batchCode}</small></div><span>{item.quantity} un.</span><strong className="text-vermelhoEscuro">{formatCurrency(item.quantity * item.unitValue)}</strong></div>)}{!losses.length && <div className="empty-state min-h-[140px]">Sem perdas neste filtro.</div>}</section></>;
    if (tab === "Estoque atual") return <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Posição atual do estoque</h2></div><div className="table-wrap border-0"><table className="data-table"><thead><tr><th>Produto</th><th>Estoque</th><th>Valor de custo</th><th>Valor potencial</th></tr></thead><tbody>{products.filter((item) => category === "Todas" || item.category === category).map((item) => <tr key={item.id}><td>{item.name}</td><td>{getStock(item)} {item.unit}</td><td>{formatCurrency(getStock(item) * item.costPrice)}</td><td>{formatCurrency(getStock(item) * item.salePrice)}</td></tr>)}</tbody></table></div></section>;
    if (tab === "Movimentações") return <section className="card p-5"><h2 className="section-title mb-6">Distribuição das movimentações</h2><div className="grid gap-5 sm:grid-cols-3">{["Entrada", "Saída", "Baixa"].map((type) => { const list = movements.filter((item) => item.type === type); return <div key={type} className="rounded-lg bg-[#f4f0e7] p-5"><span className="text-sm text-pretoClaro">{type}</span><strong className="brand-font mt-2 block text-3xl text-verdeEscuro">{list.reduce((sum, item) => sum + item.quantity, 0)} un.</strong><small>{list.length} registros</small></div>; })}</div></section>;
    if (tab === "Vencimentos") return <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Agenda de vencimentos</h2></div>{products.flatMap((product) => product.batches.map((batch) => ({ product, batch }))).toSorted((a, b) => a.batch.expiresAt.localeCompare(b.batch.expiresAt)).map(({ product, batch }) => <div className="grid grid-cols-[1fr_100px_100px] gap-4 border-b border-[#eee8dd] px-5 py-4 text-sm" key={batch.id}><strong>{product.name}</strong><span>{batch.code}</span><span className={daysUntil(batch.expiresAt) <= 7 ? "font-semibold text-vermelhoEscuro" : "text-pretoClaro"}>{getBatchState(batch.expiresAt, batch.blocked).label}</span></div>)}</section>;
    return <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Variação entre custo e venda</h2></div>{products.map((product) => { const margin = product.costPrice ? (product.salePrice / product.costPrice - 1) * 100 : 0; return <div key={product.id} className="grid grid-cols-[1fr_100px_100px_80px] items-center gap-3 border-b border-[#eee8dd] px-5 py-4 text-sm"><strong>{product.name}</strong><span>{formatCurrency(product.costPrice)}</span><span>{formatCurrency(product.salePrice)}</span><span className="badge badge-green">+{margin.toFixed(1)}%</span></div>})}</section>;
  };

  return (
    <div className="page-shell">
      <header className="page-header"><div><h1 className="page-title">Relatórios gerenciais</h1><span className="page-subtitle">Gerado em {generatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div><button className="btn btn-primary" onClick={() => window.print()}><HiOutlineArrowDownTray /> Exportar PDF</button></header>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">{tabs.map((item) => <button key={item} className={`btn ${tab === item ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab(item)}>{item}</button>)}</div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2.4fr)_300px]">
        <div>{mainContent()}</div>
        <aside className="card self-start p-5"><h2 className="section-title mb-5">Parâmetros do relatório</h2><div className="grid gap-4"><div className="field"><label>Período</label><input className="control" value={period} onChange={(event) => setPeriod(event.target.value)} /></div><div className="field"><label>Categoria</label><select className="control" value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="field"><label>Setor</label><select className="control"><option>Todos</option><option>Loja</option><option>Depósito</option></select></div><div className="field"><label>Formato</label><select className="control"><option>PDF + gráficos</option><option>Resumo executivo</option><option>Planilha</option></select></div><button className="btn btn-primary" onClick={() => setGeneratedAt(new Date())}>Gerar relatório</button></div></aside>
      </div>
    </div>
  );
}

export default Relatorios;
