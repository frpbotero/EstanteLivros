import { Cover } from "./ui/Cover";
import { Modal } from "./ui/Modal";

export function BookDetailsModal({ book, onClose, status, actions }) {
  const facts = book
    ? [
        ["Páginas", book.pages],
        ["Ano", book.year],
        ["Editora", book.publisher],
        ["ISBN", book.isbn],
      ].filter(([, value]) => value)
    : [];

  return (
    <Modal open={Boolean(book)} onClose={onClose} size="max-w-2xl" eyebrow="Detalhes da obra" title={book?.name}>
      {book && (
        <div className="flex flex-col gap-6 sm:flex-row">
          <Cover book={book} className="mx-auto w-40 shrink-0 shadow-raised sm:mx-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div>
              <p className="text-body-lg text-secondary">{book.author}</p>
              {status && <div className="mt-2">{status}</div>}
            </div>
            {facts.length > 0 && (
              <dl className="grid grid-cols-2 gap-3">
                {facts.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-surface-container-low px-3 py-2">
                    <dt className="text-label-sm uppercase tracking-wider text-secondary">{label}</dt>
                    <dd className="truncate text-body-md text-on-surface">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {book.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary-container px-3 py-1 text-label-md text-on-secondary-container">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {book.summary && (
              <p className="whitespace-pre-line text-body-md leading-relaxed text-on-surface-variant">{book.summary}</p>
            )}
            {actions && <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:justify-end">{actions}</div>}
          </div>
        </div>
      )}
    </Modal>
  );
}
