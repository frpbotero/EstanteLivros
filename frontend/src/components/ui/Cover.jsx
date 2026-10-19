import { Api } from "../../API/api";

// Capa 2:3 com fallback tipográfico quando o livro não tem imagem.
// `compact` para miniaturas (tabela, cards pequenos): só a inicial do título.
export function Cover({ book, src, className = "", rounded = "rounded-lg", sizes, compact = false }) {
  const url = src ?? Api.coverUrl(book);
  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden [container-type:inline-size] bg-surface-container shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] ${rounded} ${className}`}
    >
      {url ? (
        <img
          src={url}
          alt={book?.name ? `Capa de ${book.name}` : ""}
          loading="lazy"
          decoding="async"
          sizes={sizes}
          className="h-full w-full object-cover"
        />
      ) : compact ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-container to-primary font-serif text-[18px] font-semibold text-on-primary">
          {(book?.name || "?").trim()[0]?.toUpperCase()}
        </div>
      ) : (
        <div className="flex h-full w-full bg-gradient-to-br from-primary-container to-primary p-2 text-on-primary">
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded border border-on-primary-container/30 px-2 text-center">
            <span className="line-clamp-4 font-serif text-[clamp(13px,9cqw,22px)] font-semibold leading-tight">
              {book?.name || "Sem capa"}
            </span>
            {book?.author && (
              <>
                <span className="h-px w-6 bg-on-primary-container/60" />
                <span className="line-clamp-2 text-[10px] uppercase tracking-wider text-on-primary-container">
                  {book.author}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
