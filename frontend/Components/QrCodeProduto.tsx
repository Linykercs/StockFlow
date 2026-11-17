import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { HiOutlineArrowDownTray } from "react-icons/hi2";

// Gera o QR Code do código interno do produto (form.code), pra imprimir e colar na caixa/prateleira.
// O mesmo leitor da tela de recebimento (LeitorCodigo) já lê QR Code, então basta escanear essa etiqueta.
export default function QrCodeProduto({ codigo, nome }: { codigo: string; nome: string }) {
  const [imagem, setImagem] = useState("");

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(codigo, { width: 220, margin: 1 })
      .then((url) => { if (ativo) setImagem(url); })
      .catch(() => { if (ativo) setImagem(""); });
    return () => { ativo = false; };
  }, [codigo]);

  return (
    <section className="card grid place-items-center gap-3 p-5 text-center">
      <h2 className="section-title">QR Code do produto</h2>
      {imagem
        ? <img src={imagem} alt={`QR Code do produto ${nome}`} className="h-[220px] w-[220px]" />
        : <div className="grid h-[220px] w-[220px] place-items-center rounded-lg bg-[#f7f3eb] text-xs text-pretoClaro">Gerando QR Code...</div>}
      <p className="text-xs text-pretoClaro">Código interno: <strong>{codigo}</strong></p>
      <a
        href={imagem}
        download={`qrcode-${codigo}.png`}
        className="btn btn-secondary"
        aria-disabled={!imagem}
        onClick={(event) => { if (!imagem) event.preventDefault(); }}
      >
        <HiOutlineArrowDownTray /> Baixar etiqueta
      </a>
    </section>
  );
}
