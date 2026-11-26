import { useState, type FormEvent } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import useQrCode from "../hooks/useQrCode";
import type { ApiLoginDesafio } from "../types/Api";

interface Props {
  desafio: ApiLoginDesafio;
  error: string;
  sending: boolean;
  onConfirmar: (codigo: string) => void;
  onVoltar: () => void;
}

// 2ª etapa do login: na primeira vez (CONFIGURAR_MFA) mostra o QR Code pro usuário escanear
// com um app autenticador (Google Authenticator, Microsoft Authenticator, Authy...). Nas vezes
// seguintes (INFORMAR_CODIGO) só pede o código de 6 dígitos que o app já está gerando.
function DesafioMfa({ desafio, error, sending, onConfirmar, onVoltar }: Props) {
  const [codigo, setCodigo] = useState("");
  const primeiraConfiguracao = desafio.status === "CONFIGURAR_MFA";
  const imagemQrCode = useQrCode(desafio.otpauthUri ?? "");
  const chaveSecreta = desafio.otpauthUri?.match(/secret=([^&]+)/)?.[1] ?? "";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (codigo.trim().length === 6) onConfirmar(codigo.trim());
  };

  return (
    <main className="grid min-h-screen place-items-center bg-bege px-6 py-12">
      <form onSubmit={submit} className="card w-full max-w-md p-6">
        <button type="button" onClick={onVoltar} className="mb-4 flex items-center gap-2 text-xs text-pretoClaro"><HiOutlineArrowLeft /> Voltar</button>
        <h2 className="page-title">{primeiraConfiguracao ? "Configure o autenticador" : "Confirme sua identidade"}</h2>
        <p className="page-subtitle mb-6">
          {primeiraConfiguracao
            ? "Escaneie o QR Code com um app autenticador (Google Authenticator, Microsoft Authenticator, Authy...) e digite o código gerado."
            : "Abra seu app autenticador e digite o código de 6 dígitos gerado para o StockFlow."}
        </p>

        {primeiraConfiguracao && (
          <div className="mb-6 grid place-items-center gap-3 text-center">
            {imagemQrCode
              ? <img src={imagemQrCode} alt="QR Code de configuração do autenticador" className="h-[200px] w-[200px]" />
              : <div className="grid h-[200px] w-[200px] place-items-center rounded-lg bg-[#f7f3eb] text-xs text-pretoClaro">Gerando QR Code...</div>}
            <p className="text-xs text-pretoClaro">Não consegue escanear? Digite esta chave manualmente: <strong>{chaveSecreta}</strong></p>
          </div>
        )}

        <div className="field">
          <label htmlFor="codigo">Código de 6 dígitos</label>
          <input
            id="codigo"
            className="control text-center text-lg tracking-[0.5em]"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
        </div>

        {error && <p className="mt-4 rounded-md bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro">{error}</p>}
        <button className="btn btn-primary mt-6 w-full" type="submit" disabled={sending || codigo.length !== 6}>
          {sending ? "Confirmando..." : "Confirmar"}
        </button>
      </form>
    </main>
  );
}

export default DesafioMfa;
