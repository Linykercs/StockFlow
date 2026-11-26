import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Gera a imagem (data URL em PNG) do QR Code de um valor, usada tanto na etiqueta do produto
// quanto na configuração do autenticador (MFA).
function useQrCode(valor: string, tamanho = 220) {
  const [imagem, setImagem] = useState("");

  useEffect(() => {
    if (!valor) return;
    let ativo = true;
    QRCode.toDataURL(valor, { width: tamanho, margin: 1 })
      .then((url) => { if (ativo) setImagem(url); })
      .catch(() => { if (ativo) setImagem(""); });
    return () => { ativo = false; };
  }, [valor, tamanho]);

  return valor ? imagem : "";
}

export default useQrCode;
