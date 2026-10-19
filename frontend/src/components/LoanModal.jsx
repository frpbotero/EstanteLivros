import { useEffect, useState } from "react";
import { dateInputValue, endOfDayIso, formatDate } from "../lib/dates";
import { LOAN_DAYS } from "../lib/loans";
import { formatPhone } from "../lib/share";
import { Cover } from "./ui/Cover";
import { Icon } from "./ui/Icon";
import { Modal } from "./ui/Modal";

// Sem `request`: dono empresta direto. Com `request`: aprova um pedido pendente.
export function LoanModal({ book, request, onClose, onSubmit }) {
  const [bookingName, setBookingName] = useState("");
  const [telNumber, setTelNumber] = useState("");
  const [due, setDue] = useState(dateInputValue(LOAN_DAYS));
  const [saving, setSaving] = useState(false);
  const open = Boolean(book);

  useEffect(() => {
    if (!open) return;
    setBookingName("");
    setTelNumber("");
    setDue(dateInputValue(LOAN_DAYS));
  }, [open]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    const ok = await onSubmit({ bookingName, telNumber, dueDate: endOfDayIso(due) });
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={request ? "Aprovar pedido" : "Novo empréstimo"}
      title={request ? "Confirmar empréstimo" : "Emprestar livro"}
    >
      {book && (
        <form onSubmit={submit} className="flex flex-col gap-5" id="loan-form">
          <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-3">
            <Cover book={book} className="w-12 shrink-0" rounded="rounded" compact={!book.hasCover} />
            <div className="min-w-0">
              <p className="truncate font-serif text-headline-sm">{book.name}</p>
              <p className="truncate text-body-sm text-secondary">{book.author}</p>
            </div>
          </div>

          {request ? (
            <div className="flex items-start gap-3 rounded-xl border border-hairline p-4">
              <Icon name="person" className="text-secondary" />
              <div className="text-body-md">
                <p className="text-label-lg">{request.bookingName}</p>
                <p className="text-secondary">{formatPhone(request.telNumber)}</p>
                <p className="mt-1 text-body-sm text-outline">Pedido em {formatDate(request.bookingDate)}</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="field-label" htmlFor="loan-name">Quem vai levar *</label>
                <div className="field">
                  <Icon name="person" />
                  <input id="loan-name" value={bookingName} onChange={(e) => setBookingName(e.target.value)} placeholder="Nome do leitor" required autoFocus />
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="loan-phone">WhatsApp / telefone</label>
                <div className="field">
                  <Icon name="call" />
                  <input id="loan-phone" type="tel" inputMode="tel" value={telNumber} onChange={(e) => setTelNumber(e.target.value)} placeholder="(11) 98421-8844" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="field-label" htmlFor="loan-due">
              Devolver até
              <span className="normal-case tracking-normal text-outline">padrão: {LOAN_DAYS} dias</span>
            </label>
            <div className="field">
              <Icon name="event" />
              <input id="loan-due" type="date" value={due} min={dateInputValue(0)} onChange={(e) => setDue(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Icon name="swap_horiz" className="text-[18px]" />
              {request ? "Aprovar empréstimo" : "Registrar empréstimo"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
