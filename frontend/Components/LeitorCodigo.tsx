import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

// Abre a câmera traseira e lê código de barras ou QR code. Para sozinho no primeiro código lido.
// O navegador só libera a câmera em https ou em localhost.
export default function LeitorCodigo({ onLer, onFechar }: { onLer: (texto: string) => void; onFechar: () => void }) {
  const area = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!area.current) return;

    // Cada abertura cria o próprio <video>. Se a câmera for aberta duas vezes seguidas
    // (o React faz isso em desenvolvimento), fechar a primeira não apaga a imagem da segunda.
    const video = document.createElement("video");
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.className = "absolute inset-0 h-full w-full object-cover";
    area.current.prepend(video);

    let controles: IScannerControls | undefined;
    let ativo = true;
    const leitor = new BrowserMultiFormatReader();

    leitor.decodeFromConstraints({ video: { facingMode: "environment" } }, video, (resultado, _erro, ctrl) => {
      if (resultado && ativo) {
        ativo = false;
        ctrl.stop();
        onLer(resultado.getText());
      }
    })
      .then((ctrl) => { controles = ctrl; if (!ativo) ctrl.stop(); })
      .catch(() => { if (ativo) setErro("Não foi possível abrir a câmera. Libere o acesso no navegador ou digite o código abaixo."); });

    return () => {
      ativo = false;
      controles?.stop();
      video.remove();
    };
  }, [onLer]);

  return (
    <div ref={area} className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-[#171915]">
      <div className="absolute inset-8 rounded-lg border-2 border-[#c75d30]" />
      {erro && <p className="relative mx-6 rounded-md bg-vermelhoClaro p-3 text-center text-xs text-vermelhoEscuro">{erro}</p>}
      <button type="button" onClick={onFechar} className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white">Fechar câmera</button>
      <span className="absolute bottom-3 text-[10px] text-white/70">Aponte para o código de barras ou QR code</span>
    </div>
  );
}
