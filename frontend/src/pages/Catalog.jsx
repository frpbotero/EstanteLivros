import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Api } from "../API/api";
import { useAuth } from "../auth/AuthContext";
import { BookCard } from "../components/BookCard";
import { BookDetailsModal } from "../components/BookDetails";
import { ConfirmModal } from "../components/ConfirmModal";
import { LoanModal } from "../components/LoanModal";
import { Icon } from "../components/ui/Icon";
import { Spinner } from "../components/ui/Spinner";
import { StatCard } from "../components/ui/StatCard";
import { useLibrary } from "../data/LibraryContext";
import { useLoanActions } from "../data/useLoanActions";
import { bookStatus } from "../lib/loans";
import { copyText, publicUrl } from "../lib/share";

const FILTERS = [
  { id: "all", label: "Todos", test: () => true },
  { id: "available", label: "Disponíveis", test: (s) => s.kind === "available" },
  { id: "loaned", label: "Emprestados", test: (s) => s.kind === "loan" || s.kind === "overdue" },
  { id: "overdue", label: "Com Atraso", test: (s) => s.kind === "overdue" },
  { id: "requests", label: "Com Pedidos", test: (s) => s.pending.length > 0 },
];

const SORTS = {
  recent: { label: "Mais recentes", compare: () => 0 },
  title: { label: "Título (A–Z)", compare: (a, b) => a.name.localeCompare(b.name, "pt-BR") },
  author: { label: "Autor (A–Z)", compare: (a, b) => (a.author ?? "").localeCompare(b.author ?? "", "pt-BR") },
};

function readView() {
  try {
    return localStorage.getItem("estante.view") === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

function normalize(text = "") {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function Catalog() {
  const { user } = useAuth();
  const { books, loading, reloadBooks } = useLibrary();
  const { lend, giveBack } = useLoanActions();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState(readView);
  const [details, setDetails] = useState(null);
  const [lending, setLending] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [returning, setReturning] = useState(null);

  const withStatus = useMemo(
    () => (books ?? []).map((book) => ({ book, status: bookStatus(book) })),
    [books]
  );

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.id, withStatus.filter(({ status }) => f.test(status)).length])),
    [withStatus]
  );

  const visible = useMemo(() => {
    const term = normalize(query.trim());
    const active = FILTERS.find((f) => f.id === filter);
    return withStatus
      .filter(({ status }) => active.test(status))
      .filter(({ book }) =>
        !term ||
        [book.name, book.author, book.isbn, book.publisher, ...(book.tags ?? [])].some((field) =>
          normalize(field ?? "").includes(term)
        )
      )
      .map(({ book }) => book)
      .sort(SORTS[sort].compare);
  }, [withStatus, filter, query, sort]);

  const readers = useMemo(
    () => new Set(withStatus.filter(({ status }) => status.loan).map(({ status }) => status.loan.bookingName.trim().toLowerCase())).size,
    [withStatus]
  );

  const changeView = (next) => {
    setView(next);
    try {
      localStorage.setItem("estante.view", next);
    } catch {
      // preferência só vale nesta sessão
    }
  };

  const setQuery = (value) => {
    const updated = new URLSearchParams(params);
    if (value) updated.set("q", value);
    else updated.delete("q");
    setParams(updated, { replace: true });
  };

  const openDetails = useCallback((book) => setDetails(book), []);
  const openLend = useCallback((book) => setLending(book), []);
  const openReturn = useCallback((booking) => setReturning(booking), []);
  const openEdit = useCallback((book) => navigate(`/livros/${book._id}/editar`), [navigate]);
  const openDelete = useCallback((book) => setDeleting(book), []);
  const openPending = useCallback(() => navigate("/emprestimos?aba=pendentes"), [navigate]);

  async function deleteBook() {
    try {
      const data = await Api.books.remove(deleting._id);
      toast.success(data.message);
      setDetails(null);
      await reloadBooks();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) return <Spinner label="Carregando seu acervo…" />;

  const total = books.length;
  const loaned = counts.loaned;
  const onShelf = counts.available;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="flex max-w-xl flex-col gap-1">
          <span className="eyebrow">Catálogo curado</span>
          <h1 className="font-serif text-headline-lg-mobile text-primary lg:text-headline-lg">Acervo Pessoal</h1>
          <p className="text-body-md text-secondary">
            Gerencie seus títulos físicos, controle o histórico de empréstimos e compartilhe leituras com amigos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary" onClick={() => copyText(publicUrl(user.slug))}>
            <Icon name="share" className="text-[18px] text-secondary" />
            Compartilhar Link Público
          </button>
          <Link className="btn-secondary text-secondary" to="/emprestimos">
            <Icon name="receipt_long" className="text-[18px]" />
            Relatório
          </Link>
          <Link className="btn-primary hidden lg:inline-flex" to="/livros/novo">
            <Icon name="add" className="text-[18px]" />
            Novo Livro
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Catalogados" value={total} unit="volumes" icon="auto_stories" />
        <StatCard
          label="Na estante"
          value={onShelf}
          unit="prontos p/ leitura"
          icon="shelves"
          footer={total ? `Disponibilidade de ${Math.round((onShelf / total) * 100)}%` : null}
        />
        <StatCard
          label="Emprestados"
          value={loaned}
          unit="com amigos"
          icon="swap_horizontal_circle"
          footer={readers ? `${readers} ${readers === 1 ? "leitor" : "leitores distintos"}` : null}
        />
        <StatCard
          label="Atraso crítico"
          value={counts.overdue}
          unit={counts.overdue === 1 ? "livro" : "livros"}
          icon="notification_important"
          tone={counts.overdue ? "alert" : "default"}
          footer={counts.overdue ? <Link className="text-tertiary hover:underline" to="/emprestimos">Ver empréstimos atrasados</Link> : "Tudo em dia"}
        />
      </section>

      <section className="card flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="field h-11 flex-1">
            <Icon name="search" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, autor, gênero ou ISBN…"
              aria-label="Buscar no acervo"
            />
          </label>
          <div className="flex items-center gap-3">
            <label className="field h-11 flex-1 md:w-56 md:flex-none">
              <Icon name="sort" />
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar" className="text-body-md">
                {Object.entries(SORTS).map(([id, { label }]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </label>
            <div className="hidden rounded-xl bg-surface-container-low p-1 sm:flex">
              {[
                ["grid", "grid_view", "Grade"],
                ["list", "view_list", "Lista"],
              ].map(([id, icon, label]) => (
                <button
                  key={id}
                  onClick={() => changeView(id)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    view === id ? "bg-surface-container-lowest text-primary-container shadow-card" : "text-secondary"
                  }`}
                  aria-label={label}
                  aria-pressed={view === id}
                >
                  <Icon name={icon} className="text-[20px]" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto border-t border-hairline px-4 pt-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map(({ id, label }) => (
            <button key={id} className={`chip ${filter === id ? "chip-active" : ""}`} onClick={() => setFilter(id)}>
              {label} ({counts[id]})
            </button>
          ))}
        </div>
      </section>

      <section
        className={
          view === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-4"
            : "grid grid-cols-1 gap-4 lg:grid-cols-2"
        }
      >
        {visible.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            layout={view}
            onOpen={openDetails}
            onLend={openLend}
            onReturn={openReturn}
            onEdit={openEdit}
            onDelete={openDelete}
            onPending={openPending}
          />
        ))}
        {filter === "all" && !query && (
          <Link
            to="/livros/novo"
            className={`group flex items-center justify-center gap-4 rounded-xl border-2 border-dashed border-outline-variant/60 bg-surface-container-low/60 p-6 text-center transition-colors hover:border-primary-container hover:bg-surface-container-low ${
              view === "grid" ? "flex-col sm:min-h-[420px]" : "flex-row"
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary-container shadow-card transition-transform group-hover:scale-105">
              <Icon name="add" className="text-[26px]" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-serif text-headline-sm text-on-surface">
                {total ? "Adicionar novo livro" : "Cadastre seu primeiro livro"}
              </span>
              <span className="text-body-sm text-secondary">Capa, ISBN, editora e gêneros em um só lugar.</span>
            </span>
          </Link>
        )}
      </section>

      {visible.length === 0 && (filter !== "all" || query) && (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-secondary">
          <Icon name="search" className="text-[32px]" />
          <p>Nenhum livro encontrado com esses filtros.</p>
          <button className="btn-ghost" onClick={() => { setFilter("all"); setQuery(""); }}>Limpar filtros</button>
        </div>
      )}

      <section className="card flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary">
          <Icon name="public" className="text-[24px]" />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-headline-sm">Vitrine Pública Aberta</h2>
          <p className="text-body-sm text-secondary">
            Amigos com o link podem navegar pelo seu acervo e pedir empréstimos diretamente.
          </p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <button className="btn-secondary flex-1" onClick={() => copyText(publicUrl(user.slug))}>Copiar link</button>
          <Link className="btn-primary flex-1" to={`/u/${user.slug}`}>Ver como visitante</Link>
        </div>
      </section>

      <BookDetailsModal
        book={details}
        onClose={() => setDetails(null)}
        actions={
          details && (
            <>
              <button className="btn-secondary" onClick={() => openDelete(details)}>
                <Icon name="delete" className="text-[18px]" /> Excluir
              </button>
              <button className="btn-primary" onClick={() => openEdit(details)}>
                <Icon name="edit_note" className="text-[18px]" /> Editar
              </button>
            </>
          )
        }
      />
      <LoanModal
        book={lending}
        onClose={() => setLending(null)}
        onSubmit={(fields) => lend({ ...fields, bookId: lending._id })}
      />
      <ConfirmModal
        open={Boolean(returning)}
        title="Registrar devolução?"
        message={returning && `Confirmar que ${returning.bookingName} devolveu o livro.`}
        confirmLabel="Registrar devolução"
        danger={false}
        onConfirm={() => giveBack(returning)}
        onClose={() => setReturning(null)}
      />
      <ConfirmModal
        open={Boolean(deleting)}
        title="Excluir livro?"
        message={deleting && `"${deleting.name}" será removido do acervo. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={deleteBook}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
