import { memo } from "react";
import { bookStatus, shortName } from "../lib/loans";
import { formatShort } from "../lib/dates";
import { whatsappLink } from "../lib/share";
import { Cover } from "./ui/Cover";
import { Icon } from "./ui/Icon";
import { Menu } from "./ui/Menu";
import { StatusPill } from "./ui/StatusPill";

function statusLabel(status) {
  switch (status.kind) {
    case "loan":
      return `Emprestado: ${shortName(status.loan.bookingName)}`;
    case "overdue":
      return `Atrasado: ${shortName(status.loan.bookingName)} (${status.days} ${status.days === 1 ? "dia" : "dias"})`;
    case "unavailable":
      return "Indisponível";
    default:
      return "Disponível";
  }
}

export function reminderText(bookName, booking) {
  const first = booking.bookingName.split(" ")[0];
  return `Olá, ${first}! Tudo bem? Passando para lembrar do livro "${bookName}", com devolução prevista para ${formatShort(booking.dueDate)}. Obrigado!`;
}

function Actions({ book, status, onLend, onReturn, onEdit }) {
  if (status.kind === "overdue") {
    const link = whatsappLink(status.loan.telNumber, reminderText(book.name, status.loan));
    return (
      <div className="flex gap-2">
        {link ? (
          <a className="btn-alert flex-1 py-2" href={link} target="_blank" rel="noreferrer">
            <Icon name="chat" className="text-[18px]" /> Cobrar
          </a>
        ) : (
          <span className="btn-alert flex-1 py-2 opacity-70">Sem contato</span>
        )}
        <button className="btn-secondary px-3 py-2" onClick={() => onReturn(status.loan)} title="Registrar devolução" aria-label="Registrar devolução">
          <Icon name="assignment_return" className="text-[18px]" />
        </button>
      </div>
    );
  }
  if (status.kind === "loan") {
    return (
      <button className="btn-secondary w-full py-2" onClick={() => onReturn(status.loan)}>
        <Icon name="assignment_return" className="text-[18px]" /> Registrar Devolução
      </button>
    );
  }
  if (status.kind === "unavailable") {
    return (
      <button className="btn-secondary w-full py-2 text-secondary" onClick={() => onEdit(book)}>
        <Icon name="edit_note" className="text-[18px]" /> Alterar status
      </button>
    );
  }
  return (
    <button className="btn-secondary w-full py-2" onClick={() => onLend(book)}>
      <Icon name="person_add" className="text-[18px]" /> Emprestar
    </button>
  );
}

// layout "grid": vertical a partir de sm, horizontal no celular. "list": sempre horizontal.
export const BookCard = memo(function BookCard({ book, layout, onOpen, onLend, onReturn, onEdit, onDelete, onPending }) {
  const status = bookStatus(book);
  const grid = layout === "grid";
  const tag = book.tags?.[0];
  const meta = [book.author, book.year].filter(Boolean).join(" • ");

  return (
    <article
      className={`card group flex overflow-hidden transition-shadow hover:shadow-raised ${
        grid ? "flex-row gap-4 p-3 sm:flex-col sm:gap-0 sm:p-0" : "flex-row gap-4 p-3"
      }`}
    >
      <button
        onClick={() => onOpen(book)}
        className={`relative shrink-0 text-left ${grid ? "w-24 sm:w-full" : "w-24"}`}
        aria-label={`Ver detalhes de ${book.name}`}
      >
        <Cover book={book} rounded={grid ? "rounded-lg sm:rounded-none" : "rounded-lg"} />
        {grid && (
          <>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 bg-gradient-to-t from-black/60 to-transparent sm:block" />
            <StatusPill kind={status.kind} className="absolute left-3 top-3 hidden max-w-[85%] shadow-card sm:inline-flex">
              {statusLabel(status)}
            </StatusPill>
            <span className="absolute inset-x-3 bottom-2.5 hidden items-center justify-between gap-2 text-label-sm text-white sm:flex">
              {tag ? <span className="truncate rounded bg-black/50 px-1.5 py-0.5">{tag}</span> : <span />}
              {book.pages && <span className="shrink-0">{book.pages} págs</span>}
            </span>
          </>
        )}
      </button>

      <div className={`flex min-w-0 flex-1 flex-col gap-2 ${grid ? "sm:p-4" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <StatusPill kind={status.kind} className={`mb-2 ${grid ? "sm:hidden" : ""}`}>
              {statusLabel(status)}
            </StatusPill>
            <h3 className="truncate font-serif text-headline-sm text-on-surface" title={book.name}>
              {book.name}
            </h3>
            {meta && <p className="truncate text-body-sm text-secondary">{meta}</p>}
          </div>
          <Menu
            items={[
              { label: "Ver detalhes", icon: "visibility", onClick: () => onOpen(book) },
              { label: "Editar", icon: "edit_note", onClick: () => onEdit(book) },
              { label: "Excluir", icon: "delete", danger: true, onClick: () => onDelete(book) },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-label-sm text-secondary">
          {book.isbn && <span className="rounded bg-surface-container-low px-2 py-1">ISBN {book.isbn}</span>}
          {(status.kind === "loan" || status.kind === "overdue") && (
            <span className={`flex items-center gap-1 ${status.kind === "overdue" ? "text-status-overdue" : ""}`}>
              <Icon name={status.kind === "overdue" ? "warning" : "event"} className="text-[14px]" />
              {status.kind === "overdue" ? "Venceu em" : "Devolução:"} {formatShort(status.loan.dueDate)}
            </span>
          )}
          {status.pending.length > 0 && (
            <button onClick={onPending} className="flex items-center gap-1 rounded-full bg-status-pending-bg px-2 py-1 text-status-pending hover:bg-surface-container-high">
              <Icon name="schedule" className="text-[14px]" />
              {status.pending.length} {status.pending.length === 1 ? "pedido" : "pedidos"}
            </button>
          )}
          {book.isPublic === false && (
            <span className="flex items-center gap-1" title="Fora da vitrine pública">
              <Icon name="visibility_off" className="text-[14px]" /> Privado
            </span>
          )}
        </div>

        <div className={`mt-auto pt-2 ${grid ? "sm:border-t sm:border-hairline sm:pt-3" : ""}`}>
          <Actions book={book} status={status} onLend={onLend} onReturn={onReturn} onEdit={onEdit} />
        </div>
      </div>
    </article>
  );
});
