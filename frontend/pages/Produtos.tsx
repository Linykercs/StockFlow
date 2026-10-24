import { useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../Components/ConfirmModal";
import Toast from "../Components/Toast";
import { useStock } from "../context/StockContext";
import type { Produto } from "../types/Produto";
import { formatCurrency, getProductStatus, getStock } from "../utils/stock";

const statusClass = { "Em estoque": "badge-green", "Abaixo do mínimo": "badge-yellow", "Sem estoque": "badge-red" };

function Produtos() {
  const navigate = useNavigate();
  const { products, deleteProduct } = useStock();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [unit, setUnit] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [toDelete, setToDelete] = useState<Produto | null>(null);
  const [toast, setToast] = useState("");

  const categories = [...new Set(products.map((product) => product.category))].sort();
  const filtered = useMemo(() => products.filter((product) => {
    const search = query.toLocaleLowerCase("pt-BR");
    const matchesSearch = [product.name, product.barcode, ...product.batches.map((batch) => batch.code)].join(" ").toLocaleLowerCase("pt-BR").includes(search);
    return matchesSearch && (category === "Todas" || product.category === category) && (unit === "Todas" || product.unit === unit) && (status === "Todos" || getProductStatus(product) === status);
  }), [products, query, category, unit, status]);

  const remove = () => {
    if (!toDelete) return;
    deleteProduct(toDelete.id);
    setToDelete(null);
    setToast("Produto e registros relacionados excluídos.");
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div><h1 className="page-title">Produtos</h1><span className="page-subtitle">{products.length} itens cadastrados</span></div>
        <button className="btn btn-primary" onClick={() => navigate("/produtos/novo")}>+ Novo produto</button>
      </header>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_180px_145px_180px]">
        <label className="relative block">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-pretoClaro" />
          <input className="control pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, código de barras ou lote..." />
        </label>
        <select aria-label="Categoria" className="control" value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Unidade" className="control" value={unit} onChange={(event) => setUnit(event.target.value)}><option>Todas</option><option>PCT</option><option>UN</option><option>KG</option><option>L</option><option>CX</option></select>
        <select aria-label="Status" className="control" value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Em estoque</option><option>Abaixo do mínimo</option><option>Sem estoque</option></select>
      </section>

      <div className="table-wrap max-h-[calc(100vh-210px)]">
        <table className="data-table">
          <thead><tr><th>Produto</th><th>Código</th><th>Categoria</th><th>Un.</th><th>Estoque</th><th>Entrada</th><th>Saída</th><th>Status</th><th aria-label="Ações" /></tr></thead>
          <tbody>
            {filtered.map((product) => {
              const productStatus = getProductStatus(product);
              return <tr key={product.id}>
                <td><button onClick={() => navigate(`/produtos/${product.id}`)} className="text-left font-semibold text-verdeEscuro hover:underline">{product.name}</button></td>
                <td className="text-pretoClaro">{product.barcode}</td><td>{product.category}</td><td>{product.unit}</td><td className="font-semibold">{getStock(product)}</td>
                <td>{formatCurrency(product.costPrice)}</td><td>{formatCurrency(product.salePrice)}</td><td><span className={`badge ${statusClass[productStatus]}`}>{productStatus}</span></td>
                <td><div className="flex justify-end gap-1"><button className="btn btn-ghost icon-btn" title="Editar produto" onClick={() => navigate(`/produtos/${product.id}`)}><HiOutlinePencilSquare /></button><button className="btn btn-ghost icon-btn text-vermelhoEscuro" title="Excluir produto" onClick={() => setToDelete(product)}><HiOutlineTrash /></button></div></td>
              </tr>;
            })}
          </tbody>
        </table>
        {!filtered.length && <div className="empty-state"><div><strong className="block text-verdeEscuro">Nenhum produto encontrado</strong><span className="mt-1 block text-sm">Tente ajustar os filtros de busca.</span></div></div>}
      </div>

      <ConfirmModal open={Boolean(toDelete)} title="Excluir este produto?" confirmLabel="Excluir produto" onClose={() => setToDelete(null)} onConfirm={remove} description={<>O produto será retirado da busca. Lotes, movimentações e relatórios relacionados também poderão ser removidos.<small className="mt-3 block">Somente o administrador pode excluir produtos.</small></>} />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

export default Produtos;
