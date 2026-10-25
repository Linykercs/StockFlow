import { useMemo, useState, type FormEvent } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Toast from "../Components/Toast";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import { mensagemDeErro } from "../services/api";
import { daysUntil, formatCurrency, formatDate, getStock, unitLabel } from "../utils/stock";

const today = new Date().toISOString().slice(0, 10);

function Entrada() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { products, registerEntry } = useStock();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [unitValue, setUnitValue] = useState(products[0]?.costPrice.toString() ?? "");
  const [batchCode, setBatchCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const product = products.find((item) => item.id === productId);
  const unit = product ? unitLabel[product.unit] : "";
  const currentStock = product ? getStock(product) : 0;
  const days = expiresAt ? daysUntil(expiresAt) : null;
  const valid = Boolean(product && Number(quantity) > 0 && Number(unitValue) >= 0 && batchCode.trim() && expiresAt && (days ?? -1) >= 0);

  const changeProduct = (id: string) => { setProductId(id); const selected = products.find((item) => item.id === id); if (selected) setUnitValue(String(selected.costPrice)); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) { setError("Revise os dados da entrada. A validade não pode estar vencida."); return; }
    setSending(true);
    try {
      await registerEntry({ productId, quantity: Number(quantity), unitValue: Number(unitValue), batchCode, expiresAt });
      setError(""); setToast("Entrada registrada e estoque atualizado."); setQuantity(""); setBatchCode(""); setExpiresAt("");
    } catch (erro) {
      setError(mensagemDeErro(erro));
    } finally {
      setSending(false);
    }
  };
  const record = useMemo(() => ({ date: new Intl.DateTimeFormat("pt-BR").format(new Date()), time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()) }), []);

  return (
    <form className="page-shell" onSubmit={submit}>
      <header className="page-header"><div><h1 className="page-title">Registrar movimentação</h1><span className="page-subtitle">Nova entrada de mercadoria</span></div><div className="flex gap-2"><button type="button" className="btn btn-primary">Entrada</button><button type="button" className="btn btn-secondary" onClick={() => navigate("/saida")}>Saída</button></div></header>
      {error && <div className="mb-5 rounded-lg bg-vermelhoClaro p-3 text-sm text-vermelhoEscuro">{error}</div>}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="card p-5">
          <h2 className="section-title mb-5">Dados da entrada</h2>
          <div className="field mb-5"><label htmlFor="product">Produto</label><select id="product" className="control" value={productId} onChange={(event) => changeProduct(event.target.value)}>{products.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.barcode || item.code}</option>)}</select></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="field"><label htmlFor="quantity">Quantidade recebida ({unit})</label><input id="quantity" className="control" type="number" min="0" step={product?.unit === "UNIDADE" ? "1" : "any"} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div>
            <div className="field"><label htmlFor="value">Valor de entrada ({unit})</label><input id="value" className="control" type="number" min="0" step="0.01" value={unitValue} onChange={(event) => setUnitValue(event.target.value)} /></div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="field"><label htmlFor="batch">Nº do lote</label><input id="batch" className="control" value={batchCode} onChange={(event) => setBatchCode(event.target.value)} placeholder="L-2412" /></div>
            <div className="field"><label>Data de recebimento</label><output className="control flex items-center bg-[#f7f3eb]">{formatDate(today)} (hoje)</output></div>
            <div className="field"><label htmlFor="expires">Data de validade</label><input id="expires" className="control" type="date" min={today} value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></div>
          </div>
          <p className="mt-4 text-xs text-pretoClaro">Se o lote já existir para este produto, a quantidade é somada a ele.</p>
        </section>
        <aside className="card self-start p-5">
          <h2 className="section-title mb-5">Resumo do estoque</h2>
          <dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Estoque atual</dt><dd className="font-semibold">{currentStock} {unit}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Entrada</dt><dd className="font-semibold text-[#39794d]">+{Number(quantity) || 0} {unit}</dd></div><div className="flex justify-between border-t border-[#eee8dd] pt-3"><dt className="text-pretoClaro">Novo estoque</dt><dd className="font-semibold">{currentStock + (Number(quantity) || 0)} {unit}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Valor da entrada</dt><dd className="font-semibold">{formatCurrency((Number(quantity) || 0) * (Number(unitValue) || 0))}</dd></div></dl>
          {days !== null && <div className={`mt-5 flex gap-2 rounded-lg p-3 text-xs ${days >= 0 ? "bg-[#e3efdf] text-[#356143]" : "bg-vermelhoClaro text-vermelhoEscuro"}`}><HiOutlineCheckCircle className="shrink-0 text-lg" /><span>{days >= 0 ? `Lote dentro da validade · vence em ${days} dias` : `Validade expirada há ${Math.abs(days)} dias`}</span></div>}
          <button className="btn btn-primary mt-5 w-full" disabled={!valid || sending}>{sending ? "Registrando..." : "Confirmar entrada"}</button><button type="button" className="btn btn-secondary mt-2 w-full" onClick={() => navigate("/painel")}>Cancelar</button>
        </aside>
      </div>
      <section className="card mt-5 p-5"><h2 className="section-title mb-5">Registro automático</h2><div className="grid gap-5 text-xs sm:grid-cols-3"><div><span className="block uppercase text-pretoClaro">Usuário responsável</span><strong>{usuario?.nome}</strong></div><div><span className="block uppercase text-pretoClaro">Data e hora</span><strong>{record.date} · {record.time}</strong></div><div><span className="block uppercase text-pretoClaro">Origem</span><strong>Entrada por nota fiscal</strong></div></div></section>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </form>
  );
}

export default Entrada;
