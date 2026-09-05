import "./Badge.css";
import type { StatusLote } from "../../types/estoque";

const TEXTO_POR_STATUS: Record<StatusLote, string> = {
  EM_ESTOQUE: "Em estoque",
  BAIXO: "Estoque baixo",
  VENCENDO: "Vencendo",
  VENCIDO: "Lote vencido",
};

export function Badge({ status }: { status: StatusLote }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{TEXTO_POR_STATUS[status]}</span>;
}
