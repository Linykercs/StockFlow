import { ButtonHTMLAttributes } from "react";
import "./Button.css";

type VarianteBotao = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
}

export function Button({ variante = "primary", className, disabled, ...props }: ButtonProps) {
  const classe = ["btn", `btn--${variante}`, disabled ? "btn--disabled" : "", className]
    .filter(Boolean)
    .join(" ");

  return <button className={classe} disabled={disabled} {...props} />;
}
