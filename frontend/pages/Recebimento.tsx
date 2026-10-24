import { useState } from "react";
import { HiOutlineArrowLeft, HiOutlineCamera, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useStock } from "../context/StockContext";
import { formatCurrency, getStock } from "../utils/stock";

const today = new Date().toISOString().slice(0, 10);
const future = "2027-04-22";

function Recebimento() {
  const navigate = useNavigate();
  const { products, registerEntry } = useStock();
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [productId, setProductId] = useState(products[2]?.id ?? products[0]?.id ?? "");
  const [expected] = useState(80);
  const [counted, setCounted] = useState(74);
  const [lotCode] = useState(() => `L-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const product = products.find((item) => item.id === productId);
  const difference = counted - expected;

  const identify = () => {
    const found = products.find((item) => item.barcode === code || item.id === productId) ?? products[0];
    if (found) setProductId(found.id);
    setStep(1);
  };
  const finish = () => {
    if (!product) return;
    registerEntry({ productId: product.id, quantity: counted, unitValue: product.costPrice, batchCode: lotCode, receivedAt: today, expiresAt: future });
    setStep(3);
  };

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bege shadow-2xl">
      <header className="bg-verdeEscuro px-5 pb-5 pt-6 text-white"><div className="mb-3 flex items-center gap-3"><button aria-label="Voltar" onClick={() => step ? setStep((value) => value - 1) : navigate("/")} className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><HiOutlineArrowLeft /></button><strong className="brand-font">StockFlow</strong></div><h1 className="brand-font text-xl font-semibold">{step === 0 ? "Receber carga" : step === 1 ? "Conferindo carga" : step === 2 ? "Divergência" : "Entrada gravada"}</h1><p className="mt-1 text-xs text-verdeTexto">{step === 0 ? "Aponte para o código da nota fiscal" : step === 1 ? "Nota identificada · confira os itens" : step === 2 ? "Confira antes de gravar a entrada" : "Recebimento registrado no estoque"}</p></header>
      <div className="p-5">
        {step === 0 && <div className="grid gap-4">
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-[#171915]"><div className="absolute inset-8 rounded-lg border-2 border-[#c75d30]" /><HiOutlineCamera className="text-4xl text-white/25" /><span className="absolute bottom-3 text-[10px] text-white/50">Simulação do leitor de código</span></div>
          <section className="card p-4"><label className="mb-2 block text-xs text-pretoClaro">Chave de acesso ou código de barras</label><input className="control" value={code} onChange={(event) => setCode(event.target.value)} placeholder="7898215151107" /><select className="control mt-3" value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></section>
          <button className="btn btn-primary w-full" onClick={identify}>Identificar carga</button><button className="btn btn-secondary w-full" onClick={() => setStep(1)}>Digitar a chave manualmente</button>
        </div>}
        {step === 1 && product && <div className="grid gap-4"><div className="card flex items-center justify-between p-4 text-xs"><span>Itens conferidos</span><strong>7 de 12</strong></div><section className="card p-4"><span className="badge badge-green mb-3">Item encontrado</span><h2 className="brand-font text-lg font-bold text-verdeEscuro">{product.name}</h2><dl className="mt-4 grid gap-2 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Lote</dt><dd>{lotCode}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Validade</dt><dd>{new Intl.DateTimeFormat("pt-BR").format(new Date(`${future}T12:00:00`))}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Quantidade prevista</dt><dd>{expected} un.</dd></div></dl></section><section className="card p-4"><label className="mb-2 block text-xs font-semibold">Quantidade conferida</label><div className="flex items-center gap-3"><button className="btn btn-secondary icon-btn text-lg" onClick={() => setCounted((value) => Math.max(0, value - 1))}>−</button><input className="control text-center text-lg font-bold" type="number" value={counted} onChange={(event) => setCounted(Number(event.target.value))} /><button className="btn btn-secondary icon-btn text-lg" onClick={() => setCounted((value) => value + 1)}>+</button></div></section><button className="btn btn-primary w-full" onClick={() => setStep(2)}>Concluir conferência</button></div>}
        {step === 2 && product && <div className="grid gap-4"><section className={`rounded-lg border p-4 ${difference ? "border-[#e9c8bd] bg-vermelhoClaro" : "border-[#c9ddc7] bg-[#e5f0e1]"}`}><div className="flex gap-3"><HiOutlineExclamationTriangle className="mt-0.5 text-xl text-vermelhoEscuro" /><div><strong className="block text-sm">{difference ? "Quantidade não confere" : "Quantidade conferida"}</strong><p className="mt-1 text-xs text-pretoClaro">A nota traz {expected} un. e foram conferidas {counted} un.</p></div></div></section><section className="card p-4"><h2 className="section-title mb-4">Resumo da conferência</h2><dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Previsto</dt><dd>{expected} un.</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Contado</dt><dd>{counted} un.</dd></div><div className="flex justify-between border-t border-[#eee8dd] pt-3"><dt className="text-pretoClaro">Diferença</dt><dd className={difference ? "font-bold text-vermelhoEscuro" : "font-bold text-[#39794d]"}>{difference > 0 ? "+" : ""}{difference} un.</dd></div></dl></section>{difference !== 0 && <textarea className="control min-h-24 py-3" placeholder="Justificativa da divergência (obrigatória)" />}<button className="btn btn-danger w-full" onClick={finish}>Registrar divergência e seguir</button><button className="btn btn-secondary w-full" onClick={() => setStep(1)}>Contar de novo</button></div>}
        {step === 3 && product && <div className="grid gap-4"><section className="rounded-lg bg-[#dcebd8] p-4 text-[#326143]"><HiOutlineCheckCircle className="mb-2 text-2xl" /><strong className="block">{counted} itens somados ao estoque</strong><span className="text-xs">1 divergência registrada para o gerente revisar</span></section><section className="card p-4"><h2 className="section-title mb-4">Entrada gravada</h2><dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Itens</dt><dd>12</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Volume total</dt><dd>{counted} un.</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Valor da nota</dt><dd>{formatCurrency(counted * product.costPrice)}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Estoque atualizado</dt><dd>{getStock(product)} un.</dd></div></dl></section><div className="rounded-lg bg-[#f5e7c8] p-4 text-xs text-[#8e621b]">1 problema encontrado. O gerente receberá um alerta para revisar a divergência.</div><button className="btn btn-primary w-full" onClick={() => { setStep(0); setCode(""); }}>Receber outra carga</button><button className="btn btn-secondary w-full" onClick={() => navigate("/painel")}>Ir para o painel</button></div>}
      </div>
    </main>
  );
}

export default Recebimento;
