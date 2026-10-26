import { lazy, Suspense, useCallback, useState, type KeyboardEvent } from "react";
import { HiOutlineArrowLeft, HiOutlineCamera, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

// a biblioteca de leitura é grande, então só é baixada quando alguém abre a câmera
const LeitorCodigo = lazy(() => import("../Components/LeitorCodigo"));
import { useStock } from "../context/StockContext";
import { api, mensagemDeErro } from "../services/api";
import type { ApiRecebimento } from "../types/Api";
import { formatCurrency, getStock, unitLabel } from "../utils/stock";

const today = new Date().toISOString().slice(0, 10);

// Telas 11 a 14: lança a nota (POST /recebimentos), confere o item (PUT .../itens/{id}) e conclui (POST .../concluir)
function Recebimento() {
  const navigate = useNavigate();
  const { products, reload } = useStock();
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [nota, setNota] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [expected, setExpected] = useState("");
  const [unitValue, setUnitValue] = useState(products[0]?.costPrice.toString() ?? "");
  const [counted, setCounted] = useState(0);
  const [lotCode, setLotCode] = useState(() => `L-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [expiresAt, setExpiresAt] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [recebimento, setRecebimento] = useState<ApiRecebimento | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [aviso, setAviso] = useState("");
  const product = products.find((item) => item.id === productId);
  const unit = product ? unitLabel[product.unit] : "";
  const expectedNumber = Number(expected) || 0;
  const difference = counted - expectedNumber;

  const executar = async (acao: () => Promise<void>) => {
    setSending(true);
    try { await acao(); setError(""); } catch (erro) { setError(mensagemDeErro(erro)); } finally { setSending(false); }
  };

  const changeProduct = (id: string) => { setProductId(id); const selected = products.find((item) => item.id === id); if (selected) setUnitValue(String(selected.costPrice)); };

  // o código lido pode ser o código de barras do produto
  const lerCodigo = (valor: string) => {
    setCode(valor);
    const encontrado = products.find((item) => item.barcode && item.barcode === valor.trim());
    if (encontrado) changeProduct(encontrado.id);
  };

  // O leitor de mão (USB ou Bluetooth) funciona como teclado: digita o código e aperta Enter.
  // No Enter, o código passa pelo mesmo tratamento da câmera.
  const enterNoCodigo = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !code.trim()) return;
    event.preventDefault();
    aoLerCodigo(code);
  };

  // O que a câmera leu pode ser:
  // - a chave de acesso da NF-e (código de barras da DANFE, 44 números);
  // - o QR code da NFC-e, um link que traz a chave dentro (...?p=CHAVE|...);
  // - o código de barras (EAN) do produto.
  // Na chave, as posições 23 a 34 são a série e o número da nota.
  const aoLerCodigo = useCallback((texto: string) => {
    setLendo(false);
    const chave = texto.replace(/\s/g, "").match(/\d{44}/)?.[0];
    if (chave) {
      setCode(chave);
      setNota(String(Number(chave.slice(25, 34))));
      setAviso(`Nota ${Number(chave.slice(25, 34))} (série ${Number(chave.slice(22, 25))}) lida pela chave de acesso.`);
      return;
    }
    const valor = texto.trim();
    setCode(valor);
    const encontrado = products.find((item) => item.barcode && item.barcode === valor);
    if (encontrado) {
      setProductId(encontrado.id);
      setUnitValue(String(encontrado.costPrice));
      setAviso(`Produto encontrado: ${encontrado.name}.`);
    } else {
      setAviso(`Código ${valor} lido, mas nenhum produto tem esse código de barras.`);
    }
  }, [products]);

  const identify = () => executar(async () => {
    if (!nota.trim() || !product || expectedNumber <= 0) throw new Error("Informe o número da nota, o produto e a quantidade da nota.");
    const criado = await api.post<ApiRecebimento>("/recebimentos", {
      numeroNota: nota.trim(),
      chaveAcesso: /^\d{44}$/.test(code.trim()) ? code.trim() : null,
      itens: [{ produtoId: Number(product.id), quantidadeNota: expectedNumber, valorUnitario: Number(unitValue) || 0 }],
    });
    setRecebimento(criado);
    setCounted(expectedNumber);
    setStep(1);
  });

  const conferirEConcluir = (observacao: string | null) => executar(async () => {
    if (!recebimento) return;
    await api.put(`/recebimentos/${recebimento.id}/itens/${recebimento.itens[0].id}`, {
      quantidadeConferida: counted, codigoLote: lotCode.trim(), dataValidade: expiresAt || null, observacao,
    });
    setRecebimento(await api.post<ApiRecebimento>(`/recebimentos/${recebimento.id}/concluir`));
    await reload();
    setStep(3);
  });

  const finishCounting = () => {
    if (!lotCode.trim() || !expiresAt) { setError("Informe o lote e a validade antes de concluir."); return; }
    setError("");
    if (difference === 0) conferirEConcluir(null); else setStep(2);
  };

  const recomecar = () => {
    setStep(0); setCode(""); setNota(""); setExpected(""); setJustificativa(""); setExpiresAt(""); setRecebimento(null);
    setLotCode(`L-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  };

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bege shadow-2xl">
      <header className="bg-verdeEscuro px-5 pb-5 pt-6 text-white"><div className="mb-3 flex items-center gap-3"><button aria-label="Voltar" onClick={() => step && step < 3 ? setStep((value) => value - 1) : navigate("/painel")} className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><HiOutlineArrowLeft /></button><strong className="brand-font">StockFlow</strong></div><h1 className="brand-font text-xl font-semibold">{step === 0 ? "Receber carga" : step === 1 ? "Conferindo carga" : step === 2 ? "Divergência" : "Entrada gravada"}</h1><p className="mt-1 text-xs text-verdeTexto">{step === 0 ? "Aponte para o código da nota fiscal" : step === 1 ? `Nota ${recebimento?.numeroNota} · confira os itens` : step === 2 ? "Confira antes de gravar a entrada" : "Recebimento registrado no estoque"}</p></header>
      <div className="p-5">
        {error && <p className="mb-4 rounded-md bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro">{error}</p>}
        {step === 0 && <div className="grid gap-4">
          {lendo
            ? <Suspense fallback={<div className="grid aspect-[4/3] place-items-center rounded-xl bg-[#171915] text-xs text-white/70">Abrindo câmera...</div>}><LeitorCodigo onLer={aoLerCodigo} onFechar={() => setLendo(false)} /></Suspense>
            : <button type="button" onClick={() => { setAviso(""); setLendo(true); }} className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-[#171915]"><div className="absolute inset-8 rounded-lg border-2 border-[#c75d30]" /><span className="grid place-items-center gap-2 text-white/80"><HiOutlineCamera className="text-4xl" /><span className="text-sm font-semibold">Abrir câmera para ler o código</span></span><span className="absolute bottom-3 text-[10px] text-white/50">Código de barras da nota, QR code da NFC-e ou código do produto</span></button>}
          {aviso && <p className="rounded-md bg-[#e3efdf] p-3 text-xs text-[#356143]">{aviso}</p>}
          <section className="card grid gap-3 p-4">
            <div><label className="mb-2 block text-xs text-pretoClaro">Chave de acesso ou código de barras</label><input className="control" autoFocus value={code} onChange={(event) => lerCodigo(event.target.value)} onKeyDown={enterNoCodigo} placeholder="Leia com o leitor ou digite e aperte Enter" /></div>
            <div><label className="mb-2 block text-xs text-pretoClaro">Número da nota</label><input className="control" value={nota} onChange={(event) => setNota(event.target.value)} placeholder="45900" /></div>
            <div><label className="mb-2 block text-xs text-pretoClaro">Produto</label><select className="control" value={productId} onChange={(event) => changeProduct(event.target.value)}>{products.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-xs text-pretoClaro">Quantidade na nota ({unit})</label><input className="control" type="number" min="0" step="any" value={expected} onChange={(event) => setExpected(event.target.value)} /></div><div><label className="mb-2 block text-xs text-pretoClaro">Valor unitário</label><input className="control" type="number" min="0" step="0.01" value={unitValue} onChange={(event) => setUnitValue(event.target.value)} /></div></div>
          </section>
          <button className="btn btn-primary w-full" onClick={identify} disabled={sending}>{sending ? "Lançando nota..." : "Identificar carga"}</button>
        </div>}
        {step === 1 && product && <div className="grid gap-4"><div className="card flex items-center justify-between p-4 text-xs"><span>Itens conferidos</span><strong>{recebimento?.itensConferidos ?? 0} de {recebimento?.totalItens ?? 1}</strong></div><section className="card p-4"><span className="badge badge-green mb-3">Item encontrado</span><h2 className="brand-font text-lg font-bold text-verdeEscuro">{product.name}</h2><div className="mt-4 grid gap-3 text-sm"><div><label className="mb-1 block text-xs text-pretoClaro">Lote</label><input className="control" value={lotCode} onChange={(event) => setLotCode(event.target.value)} /></div><div><label className="mb-1 block text-xs text-pretoClaro">Validade</label><input className="control" type="date" min={today} value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></div><div className="flex justify-between"><span className="text-pretoClaro">Quantidade prevista</span><span>{expectedNumber} {unit}</span></div></div></section><section className="card p-4"><label className="mb-2 block text-xs font-semibold">Quantidade conferida</label><div className="flex items-center gap-3"><button type="button" className="btn btn-secondary icon-btn text-lg" onClick={() => setCounted((value) => Math.max(0, value - 1))}>−</button><input className="control text-center text-lg font-bold" type="number" min="0" step="any" value={counted} onChange={(event) => setCounted(Number(event.target.value))} /><button type="button" className="btn btn-secondary icon-btn text-lg" onClick={() => setCounted((value) => value + 1)}>+</button></div></section><button className="btn btn-primary w-full" onClick={finishCounting} disabled={sending}>{sending ? "Gravando..." : "Concluir conferência"}</button></div>}
        {step === 2 && product && <div className="grid gap-4"><section className="rounded-lg border border-[#e9c8bd] bg-vermelhoClaro p-4"><div className="flex gap-3"><HiOutlineExclamationTriangle className="mt-0.5 text-xl text-vermelhoEscuro" /><div><strong className="block text-sm">Quantidade não confere</strong><p className="mt-1 text-xs text-pretoClaro">A nota traz {expectedNumber} {unit} e foram conferidas {counted} {unit}.</p></div></div></section><section className="card p-4"><h2 className="section-title mb-4">Resumo da conferência</h2><dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Previsto</dt><dd>{expectedNumber} {unit}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Contado</dt><dd>{counted} {unit}</dd></div><div className="flex justify-between border-t border-[#eee8dd] pt-3"><dt className="text-pretoClaro">Diferença</dt><dd className="font-bold text-vermelhoEscuro">{difference > 0 ? "+" : ""}{difference} {unit}</dd></div></dl></section><textarea className="control min-h-24 py-3" placeholder="Justificativa da divergência (obrigatória)" value={justificativa} onChange={(event) => setJustificativa(event.target.value)} /><button className="btn btn-danger w-full" disabled={!justificativa.trim() || sending} onClick={() => conferirEConcluir(justificativa.trim())}>{sending ? "Gravando..." : "Registrar divergência e seguir"}</button><button className="btn btn-secondary w-full" onClick={() => setStep(1)}>Contar de novo</button></div>}
        {step === 3 && product && <div className="grid gap-4"><section className="rounded-lg bg-[#dcebd8] p-4 text-[#326143]"><HiOutlineCheckCircle className="mb-2 text-2xl" /><strong className="block">{counted} {unit} somados ao estoque</strong>{difference !== 0 && <span className="text-xs">1 divergência registrada para o gerente revisar</span>}</section><section className="card p-4"><h2 className="section-title mb-4">Entrada gravada</h2><dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-pretoClaro">Nota</dt><dd>{recebimento?.numeroNota}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Lote</dt><dd>{lotCode}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Valor conferido</dt><dd>{formatCurrency(counted * (Number(unitValue) || 0))}</dd></div><div className="flex justify-between"><dt className="text-pretoClaro">Estoque atualizado</dt><dd>{getStock(product)} {unit}</dd></div></dl></section><button className="btn btn-primary w-full" onClick={recomecar}>Receber outra carga</button><button className="btn btn-secondary w-full" onClick={() => navigate("/painel")}>Ir para o painel</button></div>}
      </div>
    </main>
  );
}

export default Recebimento;
