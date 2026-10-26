import { useEffect, type ReactNode } from "react";
import { HiOutlineExclamationTriangle, HiOutlineTrash } from "react-icons/hi2";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({ open, title, description, confirmLabel = "Confirmar", danger = true, onConfirm, onClose }: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className={`mb-4 grid h-10 w-10 place-items-center rounded-full ${danger ? "bg-vermelhoClaro text-vermelhoEscuro" : "bg-[#f7ebcf] text-[#96671a]"}`}>
          {danger ? <HiOutlineTrash /> : <HiOutlineExclamationTriangle />}
        </div>
        <h2 id="confirm-title" className="brand-font mb-2 text-xl font-bold text-verdeEscuro">{title}</h2>
        <div className="text-sm leading-6 text-pretoClaro">{description}</div>
        <div className="mt-7 flex justify-end gap-3">
          {/* type="button": a janela pode ficar dentro de um formulário, e sem isso o clique também envia o formulário */}
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
