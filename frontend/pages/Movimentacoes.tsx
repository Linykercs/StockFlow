import { useMemo, useState } from "react";
import { HiOutlineArrowDownTray, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useStock } from "../context/StockContext";
import { formatCurrency, formatDateTime } from "../utils/stock";

function Movimentacoes() {
  const { movements } = useStock();
  const [period, setPeriod] = useState("30 dias");
  const [type, setType] = useState("Todos");
  const [product, setProduct] = useState("Todos");
  const [batch, setBatch] = useState("Todos");
  const [user, setUser] = useState("Todos");
  const [query, setQuery] = useState("");
  const unique = (values: string[]) => [...new Set(values)].sort();
  const filtered = useMemo(() => movements.filter((movement) => (type === "Todos" || movement.type === type) && (product === "Todos" || movement.productName === product) && (batch === "Todos" || movement.batchCode === batch) && (user === "Todos" || movement.user === user) && movement.productName.toLowerCase().includes(query.toLowerCase())), [movements, type, product, batch, user, query]);
  const entrances = filtered.filter((item) => item.type === "Entrada").reduce((sum, item) => sum + item.quantity, 0);
  const exits = filtered.filter((item) => item.type === "Saída").reduce((sum, item) => sum + item.quantity, 0);
  const writeOffs = filtered.filter((item) => item.type === "Baixa").reduce((sum, item) => sum + item.quantity, 0);
  const total = entrances - exits - writeOffs;

  const exportCsv = () => {
    const rows = [["Data", "Tipo", "Produto", "Lote", "Quantidade", "Valor unitario", "Responsavel"], ...filtered.map((item) => [formatDateTime(item.createdAt), item.type, item.productName, item.batchCode, String(item.quantity), item.unitValue.toFixed(2), item.user])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "movimentacoes-stockflow.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <header className="page-header"><div><h1 className="page-title">Movimentações</h1><span className="page-subtitle">Histórico completo de entradas, saídas e baixas.</span></div><button className="btn btn-primary" onClick={exportCsv}><HiOutlineArrowDownTray /> Exportar CSV</button></header>
      <section className="mb-4 flex flex-wrap gap-2">{["Hoje", "7 dias", "30 dias", "Personalizado"].map((item) => <button key={item} className={`btn ${period === item ? "btn-primary" : "btn-secondary"}`} onClick={() => setPeriod(item)}>{item}</button>)}</section>
      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_repeat(4,150px)]">
        <label className="relative"><HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-pretoClaro" /><input className="control pl-10" placeholder="Buscar produto..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <select className="control" value={type} onChange={(event) => setType(event.target.value)}><option>Todos</option><option>Entrada</option><option>Saída</option><option>Baixa</option></select>
        <select className="control" value={product} onChange={(event) => setProduct(event.target.value)}><option>Todos</option>{unique(movements.map((item) => item.productName)).map((item) => <option key={item}>{item}</option>)}</select>
        <select className="control" value={batch} onChange={(event) => setBatch(event.target.value)}><option>Todos</option>{unique(movements.map((item) => item.batchCode)).map((item) => <option key={item}>{item}</option>)}</select>
        <select className="control" value={user} onChange={(event) => setUser(event.target.value)}><option>Todos</option>{unique(movements.map((item) => item.user)).map((item) => <option key={item}>{item}</option>)}</select>
      </section>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Data</th><th>Tipo</th><th>Produto</th><th>Lote</th><th>Quantidade</th><th>Valor (un.)</th><th>Responsável</th></tr></thead><tbody>{filtered.map((movement) => <tr key={movement.id}><td>{formatDateTime(movement.createdAt)}</td><td><span className={`badge ${movement.type === "Entrada" ? "badge-green" : movement.type === "Saída" ? "badge-red" : "badge-yellow"}`}>{movement.type}</span></td><td className="font-semibold">{movement.productName}</td><td>{movement.batchCode}</td><td className={movement.type === "Entrada" ? "text-[#357b4c]" : "text-vermelhoEscuro"}>{movement.type === "Entrada" ? "+" : "-"}{movement.quantity}</td><td>{formatCurrency(movement.unitValue)}</td><td>{movement.user}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state">Nenhuma movimentação encontrada.</div>}</div>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Entradas no período", value: `+${entrances} un.`, color: "text-[#357b4c]" }, { label: "Saídas no período", value: `-${exits} un.`, color: "text-vermelhoEscuro" }, { label: "Baixas por validade", value: `-${writeOffs} un.`, color: "text-[#a66027]" }, { label: "Saldo", value: `${total >= 0 ? "+" : ""}${total} un.`, color: "text-verdeEscuro" }].map((item) => <div className="card p-4" key={item.label}><span className="text-xs text-pretoClaro">{item.label}</span><strong className={`mt-1 block text-xl ${item.color}`}>{item.value}</strong></div>)}</section>
    </div>
  );
}

export default Movimentacoes;
