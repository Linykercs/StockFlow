import { useCallback, useEffect, useState } from "react";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import { nomeDoMotivo, useStock } from "../context/StockContext";
import { api, mensagemDeErro } from "../services/api";
import type { ApiRelatorioPerdas } from "../types/Api";
import { daysUntil, formatCurrency, formatDate, getBatchState, getStock, unitLabel } from "../utils/stock";

const tabs = ["Estoque atual", "Movimentações", "Perdas", "Vencimentos", "Variação de valores"];
const nomeDoMes = (mes: string) => new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(`${mes}-15T12:00:00`)).replace(".", "");

// sem datas, o backend usa os últimos 6 meses
const hoje = new Date().toISOString().slice(0, 10);
const seisMeses = (() => { const data = new Date(); data.setMonth(data.getMonth() - 5, 1); return data.toISOString().slice(0, 10); })();

function Relatorios() {
  const { products, movements, categories } = useStock();
  const [tab, setTab] = useState("Perdas");
  const [categoryId, setCategoryId] = useState("");
  const [inicio, setInicio] = useState(seisMeses);
  const [fim, setFim] = useState(hoje);
  const [generatedAt, setGeneratedAt] = useState(new Date());
  const [perdas, setPerdas] = useState<ApiRelatorioPerdas | null>(null);
  const [erro, setErro] = useState("");

  // RF06: perdas por validade e avaria vêm do GET /relatorios/perdas
  const gerar = useCallback(async () => {
    const filtros = new URLSearchParams({ inicio, fim });
    if (categoryId) filtros.set("categoriaId", categoryId);
    try {
      setPerdas(await api.get<ApiRelatorioPerdas>(`/relatorios/perdas?${filtros}`));
      setErro("");
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
    setGeneratedAt(new Date());
  }, [inicio, fim, categoryId]);

  // gera uma vez ao abrir; depois, só pelo botão "Gerar relatório"
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { gerar(); }, []);

  const categoria = categories.find((item) => String(item.id) === categoryId)?.nome;
  const doFiltro = products.filter((item) => !categoria || item.category === categoria);
  const months = perdas?.porMes ?? [];
  const max = Math.max(...months.map((item) => item.valorTotal), 1);
  const media = months.length ? months.reduce((soma, item) => soma + item.valorTotal, 0) / months.length : 0;

  const mainContent = () => {
    if (tab === "Perdas") return <><section className="card p-5"><div className="mb-6 flex items-center justify-between"><h2 className="section-title">Perdas por validade e avaria · {months.length} meses</h2><span className="text-xs text-pretoClaro">Média {formatCurrency(media)}/mês</span></div><div className="flex h-52 items-end gap-5 border-b border-[#dcd4c7] px-2">{months.map((item, index) => <div key={item.mes} className="flex h-full flex-1 flex-col justify-end gap-2 text-center"><span className="text-[10px] text-pretoClaro">{formatCurrency(item.valorTotal)}</span><div className={`mx-auto w-full max-w-20 rounded-t ${index === months.length - 1 ? "bg-verdeEscuro" : "bg-[#a9c59f]"}`} style={{ height: `${Math.max(4, item.valorTotal / max * 78)}%` }} /><span className="pb-2 text-xs capitalize text-pretoClaro">{nomeDoMes(item.mes)}</span></div>)}</div></section><section className="card mt-5 overflow-hidden"><div className="flex items-center justify-between border-b border-[#eee8dd] p-5"><h2 className="section-title">Detalhamento das perdas do período</h2><strong className="text-vermelhoEscuro">{formatCurrency(perdas?.valorTotal ?? 0)}</strong></div>{(perdas?.itens ?? []).map((item, index) => <div className="flex items-center justify-between border-b border-[#eee8dd] px-5 py-4 text-sm last:border-0" key={`${item.lote}-${index}`}><div><strong className="block">{item.produto.nome}</strong><small className="text-pretoClaro">Lote {item.lote} · {nomeDoMotivo[item.motivo]} · {formatDate(item.dataHora)}</small></div><span>{item.quantidade}</span><strong className="text-vermelhoEscuro">{formatCurrency(item.valorTotal)}</strong></div>)}{!perdas?.itens.length && <div className="empty-state min-h-[140px]">Sem perdas neste filtro.</div>}</section></>;
    if (tab === "Estoque atual") return <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Posição atual do estoque</h2></div><div className="table-wrap border-0"><table className="data-table"><thead><tr><th>Produto</th><th>Estoque</th><th>Valor de custo</th><th>Valor potencial</th></tr></thead><tbody>{doFiltro.map((item) => <tr key={item.id}><td>{item.name}</td><td>{getStock(item)} {unitLabel[item.unit]}</td><td>{formatCurrency(getStock(item) * item.costPrice)}</td><td>{formatCurrency(getStock(item) * item.salePrice)}</td></tr>)}</tbody></table></div></section>;
    if (tab === "Movimentações") return <section className="card p-5"><h2 className="section-title mb-6">Distribuição das movimentações</h2><div className="grid gap-5 sm:grid-cols-3">{["Entrada", "Saída", "Baixa"].map((type) => { const list = movements.filter((item) => item.type === type && item.createdAt.slice(0, 10) >= inicio && item.createdAt.slice(0, 10) <= fim); return <div key={type} className="rounded-lg bg-[#f4f0e7] p-5"><span className="text-sm text-pretoClaro">{type}</span><strong className="brand-font mt-2 block text-3xl text-verdeEscuro">{formatCurrency(list.reduce((sum, item) => sum + item.quantity * item.unitValue, 0))}</strong><small>{list.length} registros</small></div>; })}</div></section>;
    if (tab === "Vencimentos") return <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Agenda de vencimentos</h2></div>{doFiltro.flatMap((product) => product.batches.filter((batch) => !batch.blocked && batch.quantity > 0 && batch.expiresAt).map((batch) => ({ product, batch }))).toSorted((a, b) => a.batch.expiresAt.localeCompare(b.batch.expiresAt)).map(({ product, batch }) => <div className="grid grid-cols-[1fr_100px_100px] gap-4 border-b border-[#eee8dd] px-5 py-4 text-sm" key={batch.id}><strong>{product.name}</strong><span>{batch.code}</span><span className={daysUntil(batch.expiresAt) <= 7 ? "font-semibold text-vermelhoEscuro" : "text-pretoClaro"}>{getBatchState(batch.expiresAt, batch.blocked).label}</span></div>)}</section>;
    return <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Variação entre custo e venda</h2></div>{doFiltro.map((product) => { const margin = product.costPrice ? (product.salePrice / product.costPrice - 1) * 100 : 0; return <div key={product.id} className="grid grid-cols-[1fr_100px_100px_80px] items-center gap-3 border-b border-[#eee8dd] px-5 py-4 text-sm"><strong>{product.name}</strong><span>{formatCurrency(product.costPrice)}</span><span>{formatCurrency(product.salePrice)}</span><span className="badge badge-green">+{margin.toFixed(1)}%</span></div>})}</section>;
  };

  return (
    <div className="page-shell">
      <header className="page-header"><div><h1 className="page-title">Relatórios gerenciais</h1><span className="page-subtitle">Gerado em {generatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div><button className="btn btn-primary" onClick={() => window.print()}><HiOutlineArrowDownTray /> Exportar PDF</button></header>
      {erro && <div className="mb-5 rounded-lg bg-vermelhoClaro p-3 text-sm text-vermelhoEscuro">{erro}</div>}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">{tabs.map((item) => <button key={item} className={`btn ${tab === item ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab(item)}>{item}</button>)}</div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2.4fr)_300px]">
        <div>{mainContent()}</div>
        <aside className="card self-start p-5"><h2 className="section-title mb-5">Parâmetros do relatório</h2><div className="grid gap-4"><div className="grid grid-cols-2 gap-3"><div className="field"><label htmlFor="inicio">De</label><input id="inicio" className="control" type="date" value={inicio} max={fim} onChange={(event) => setInicio(event.target.value)} /></div><div className="field"><label htmlFor="fim">Até</label><input id="fim" className="control" type="date" value={fim} min={inicio} onChange={(event) => setFim(event.target.value)} /></div></div><div className="field"><label>Categoria</label><select className="control" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Todas</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div><button className="btn btn-primary" onClick={gerar}>Gerar relatório</button></div></aside>
      </div>
    </div>
  );
}

export default Relatorios;
