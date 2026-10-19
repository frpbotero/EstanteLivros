import { useState } from "react";
import { Modal } from "./ui/Modal";

export function ConfirmModal({ open, title, message, confirmLabel = "Confirmar", danger = true, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await onConfirm();
    setBusy(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="max-w-md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className={danger ? "btn bg-tertiary-container text-on-tertiary hover:bg-tertiary" : "btn-primary"}
            onClick={confirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body-lg text-on-surface-variant">{message}</p>
    </Modal>
  );
}
