import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

// Bottom sheet no celular, diálogo centralizado a partir de sm.
export function Modal({ open, onClose, title, eyebrow, children, footer, size = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        className="absolute inset-0 bg-[rgba(20,30,28,0.45)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fechar"
        tabIndex={-1}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-surface-container-lowest shadow-sheet sm:rounded-2xl sm:shadow-raised ${size}`}
      >
        <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-[#d1ddd9] sm:hidden" />
        <header className="flex items-start justify-between gap-4 px-6 pb-2 pt-4 sm:pt-6">
          <div>
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            {title && <h2 className="font-serif text-headline-md text-on-surface">{title}</h2>}
          </div>
          <button className="btn-icon -mr-2" onClick={onClose} aria-label="Fechar">
            <Icon name="close" />
          </button>
        </header>
        <div className="overflow-y-auto px-6 pb-6 pt-2">{children}</div>
        {footer && (
          <footer className="flex flex-col-reverse gap-3 border-t border-hairline px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}
