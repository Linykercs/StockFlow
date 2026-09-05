import { InputHTMLAttributes } from "react";
import "./Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  mensagemErro?: string;
  textoApoio?: string;
}

export function Input({ rotulo, mensagemErro, textoApoio, id, ...props }: InputProps) {
  const inputId = id ?? rotulo.toLowerCase().replace(/\s+/g, "-");
  const comErro = Boolean(mensagemErro);

  return (
    <div className="campo">
      <label className="campo__rotulo" htmlFor={inputId}>
        {rotulo}
      </label>
      <div className={`campo__container ${comErro ? "campo__container--erro" : ""}`}>
        <input id={inputId} {...props} />
      </div>
      {comErro ? (
        <p className="campo__erro">{mensagemErro}</p>
      ) : textoApoio ? (
        <p className="campo__apoio">{textoApoio}</p>
      ) : null}
    </div>
  );
}
