import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Api, session } from "../API/api";
import { BookDetailsModal } from "../components/BookDetails";
import { Avatar } from "../components/ui/Avatar";
import { Brand } from "../components/ui/Brand";
import { Cover } from "../components/ui/Cover";
import { Icon } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { StatusPill } from "../components/ui/StatusPill";
import { daysBetween } from "../lib/dates";
import { shareLink } from "../lib/share";
import { NotFound } from "./NotFound";

function availability(book) {
  if (book.onLoan) {
    const left = Math.max(0, daysBetween(new Date(), book.dueDate));
    return { open: false, kind: "loan", label: left ? `Emprestado • Volta em ${left} ${left === 1 ? "dia" : "dias"}` : "Emprestado" };
  }
  if (book.available === false) return { open: false, kind: "unavailable", label: "Indisponível" };
  return { open: true, kind: "available", label: "Disponível" };
}

function RequestModal({ slug, book, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (book) setSent(false);
  }, [book]);

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    try {
      await Api.public.book(slug, { bookId: book._id, bookingName: name, telNumber: phone });
      setSent(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={Boolean(book)} onClose={onClose} eyebrow="Pedir emprestado" title={sent ? "Pedido enviado!" : book?.name}>
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-status-available-bg text-status-available">
            <Icon name="check_circle" className="text-[32px]" />
          </span>
          <p className="text-body-lg text-on-surface-variant">
            O dono da estante recebeu seu pedido e vai combinar a retirada pelo telefone informado.
          </p>
          <button className="btn-primary w-full sm:w-auto" onClick={onClose}>Voltar à vitrine</button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label className="field-label" htmlFor="request-name">Seu nome *</label>
            <div className="field">
              <Icon name="person" />
              <input id="request-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoFocus placeholder="Como o dono te conhece" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="request-phone">WhatsApp *</label>
            <div className="field">
              <Icon name="call" />
              <input id="request-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={9} placeholder="(11) 98421-8844" />
            </div>
          </div>
          <button type="submit" className="btn-primary h-12" disabled={sending}>
            <Icon name="send" className="text-[18px]" /> {sending ? "Enviando…" : "Enviar pedido"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function PublicBookCard({ book, onOpen, onRequest }) {
  const state = availability(book);
  const meta = [book.publisher, book.year].filter(Boolean).join(" • ");
  const footer = [book.pages && `${book.pages} págs`, book.tags?.[0]].filter(Boolean);

  return (
    <article className="card flex flex-row gap-4 p-3 transition-shadow hover:shadow-raised sm:flex-col sm:gap-0 sm:p-3">
      <button onClick={() => onOpen(book)} className="relative w-24 shrink-0 sm:w-full" aria-label={`Ver detalhes de ${book.name}`}>
        <Cover book={book} rounded="rounded-lg" />
        <StatusPill kind={state.kind} icon={state.open ? undefined : "schedule"} className="absolute left-2 top-2 hidden max-w-[90%] shadow-card sm:inline-flex">
          {state.label}
        </StatusPill>
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:pt-4">
        <StatusPill kind={state.kind} className="mb-1 self-start sm:hidden">{state.label}</StatusPill>
        {meta && <p className="truncate text-label-sm uppercase tracking-wider text-secondary">{meta}</p>}
        <h3 className="truncate font-serif text-headline-sm" title={book.name}>{book.name}</h3>
        <p className="truncate text-body-sm text-secondary">{book.author}</p>
        {book.summary && <p className="line-clamp-2 text-body-sm text-on-surface-variant sm:hidden">{book.summary}</p>}
        {footer.length > 0 && (
          <p className="mt-1 hidden items-center gap-1.5 text-label-sm text-secondary sm:flex">
            <Icon name="menu_book" className="text-[14px]" /> {footer.join(" • ")}
          </p>
        )}
        <div className="mt-auto pt-3">
          {state.open ? (
            <button className="btn-primary w-full py-2" onClick={() => onRequest(book)}>
              <Icon name="bookmark_add" className="text-[18px]" /> Pedir Emprestado
            </button>
          ) : (
            <span className="btn w-full bg-surface-container py-2 text-secondary">
              <Icon name="lock_clock" className="text-[18px]" /> Indisponível no momento
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function PublicLibrary() {
  const { slug } = useParams();
  const [library, setLibrary] = useState();
  const [missing, setMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [details, setDetails] = useState(null);
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    setLibrary(undefined);
    setMissing(false);
    Api.public
      .library(slug)
      .then(setLibrary)
      .catch((error) => (error.status === 404 ? setMissing(true) : toast.error(error.message)));
  }, [slug]);

  const books = library?.books ?? [];
  const topTags = useMemo(() => {
    const counts = new Map();
    books.forEach((book) => book.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [books]);

  const availableCount = books.filter((book) => availability(book).open).length;

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return books.filter((book) => {
      if (filter === "available" && !availability(book).open) return false;
      if (filter.startsWith("tag:") && !book.tags?.includes(filter.slice(4))) return false;
      if (!term) return true;
      return [book.name, book.author, ...(book.tags ?? [])].some((field) => field?.toLowerCase().includes(term));
    });
  }, [books, query, filter]);

  if (missing) return <NotFound />;
  if (!library) return <Spinner label="Abrindo a estante…" />;

  const { owner, stats } = library;
  const firstName = owner.name.split(" ")[0];
  const requestBook = (book) => {
    setDetails(null);
    setRequesting(book);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-surface/90 shadow-bar backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 lg:px-10">
          <Link to="/" aria-label="Bookstore">
            <Brand subtitle="Vitrine pública" />
          </Link>
          <nav className="hidden gap-8 text-label-md text-on-surface-variant md:flex">
            <a href="#acervo" className="hover:text-primary-container">Vitrine de Livros</a>
            <a href="#regras" className="hover:text-primary-container">Como funciona</a>
          </nav>
          <Link to={session.hasToken() ? "/" : "/login"} className="btn-ghost px-3 text-label-md">
            {session.hasToken() ? "Acessar painel" : "Entrar"}
            <Icon name="person" className="text-[20px]" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-6 lg:gap-10 lg:px-10 lg:py-8">
        <section className="flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-surface-container-low to-secondary-container/40 p-5 shadow-card sm:p-8 md:flex-row md:items-center">
          <Avatar name={owner.name} className="h-20 w-20 text-headline-md sm:h-24 sm:w-24" />
          <div className="flex-1">
            <span className="eyebrow">Vitrine literária</span>
            <h1 className="font-serif text-headline-lg-mobile text-on-surface sm:text-headline-lg">Estante de {owner.name}</h1>
            <p className="mt-1 max-w-xl text-body-md text-on-surface-variant">
              Escolha uma edição do acervo e peça emprestado sem burocracia.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-body-sm text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary-container" />
                {availableCount} {availableCount === 1 ? "livro disponível" : "livros disponíveis"} para empréstimo
              </span>
              {stats.completedLoans > 0 && (
                <span className="flex items-center gap-1.5">
                  <Icon name="volunteer_activism" className="text-[16px]" />
                  {stats.completedLoans} empréstimos concluídos
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <button className="btn-secondary flex-1" onClick={() => shareLink({ title: `Estante de ${owner.name}`, url: window.location.href })}>
              <Icon name="share" className="text-[18px]" /> Compartilhar catálogo
            </button>
            <a href="#acervo" className="btn-primary flex-1">
              <Icon name="menu_book" className="text-[18px]" /> Explorar acervo
            </a>
          </div>
        </section>

        <section id="acervo" className="flex scroll-mt-24 flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="field h-11 bg-surface-container-lowest shadow-card md:w-96">
              <Icon name="search" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Pesquisar na estante de ${firstName}…`} aria-label="Pesquisar livros" />
            </label>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
              <button className={`chip ${filter === "all" ? "chip-active" : ""}`} onClick={() => setFilter("all")}>Todos ({books.length})</button>
              <button className={`chip ${filter === "available" ? "chip-active" : ""}`} onClick={() => setFilter("available")}>Disponíveis ({availableCount})</button>
              {topTags.map(([tag, count]) => (
                <button key={tag} className={`chip ${filter === `tag:${tag}` ? "chip-active" : ""}`} onClick={() => setFilter(`tag:${tag}`)}>
                  {tag} ({count})
                </button>
              ))}
            </div>
          </div>

          {visible.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((book) => (
                <PublicBookCard key={book._id} book={book} onOpen={setDetails} onRequest={requestBook} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center gap-2 p-10 text-center text-secondary">
              <Icon name="menu_book" className="text-[32px]" />
              {books.length ? "Nenhum livro encontrado." : "Esta estante ainda não tem livros públicos."}
            </div>
          )}
        </section>

        <section id="regras" className="scroll-mt-24 rounded-2xl bg-surface-container-low p-5 sm:p-8">
          <span className="eyebrow">Como funciona o acervo</span>
          <h2 className="mb-5 mt-1 font-serif text-headline-md">Regras simples de convivência e empréstimo</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["calendar_month", `Prazo de ${stats.loanDays} dias`, "Tempo suficiente para uma leitura proveitosa. Dá para renovar combinando com o dono."],
              ["handshake", "Retirada combinada", "Depois do pedido, o dono entra em contato pelo WhatsApp para combinar a entrega."],
              ["volunteer_activism", "Cuidado mútuo", "Trate cada exemplar com o mesmo carinho que você gostaria que tivessem com os seus."],
            ].map(([icon, title, text]) => (
              <div key={title} className="card flex gap-4 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-primary-container">
                  <Icon name={icon} className="text-[20px]" />
                </span>
                <div>
                  <h3 className="font-serif text-headline-sm">{title}</h3>
                  <p className="text-body-sm text-secondary">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-primary p-6 text-on-primary sm:p-10">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-label-sm uppercase tracking-wider text-primary-fixed">
                <Icon name="auto_awesome" className="text-[14px]" /> Circule leituras
              </span>
              <h2 className="mt-3 font-serif text-headline-lg-mobile sm:text-headline-lg">
                Gostou da ideia? Monte a sua própria estante virtual.
              </h2>
              <p className="mt-2 text-body-md text-on-primary-container">
                Catalogue seus títulos, compartilhe com amigos e acompanhe seus empréstimos sem planilhas. É gratuito.
              </p>
            </div>
            <Link to="/login?modo=cadastro" className="btn h-12 bg-primary-fixed px-6 text-primary hover:bg-white">
              <Icon name="person_add" className="text-[18px]" /> Criar minha estante
            </Link>
          </div>
          <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-2 px-4 py-6 text-body-sm text-secondary sm:flex-row lg:px-10">
          <span><strong className="font-serif text-headline-sm text-on-surface">Bookstore</strong> — Acervo pessoal & empréstimos</span>
          <span>Biblioteca de {owner.name}</span>
        </div>
      </footer>

      <BookDetailsModal
        book={details}
        onClose={() => setDetails(null)}
        status={details && <StatusPill kind={availability(details).kind}>{availability(details).label}</StatusPill>}
        actions={
          details &&
          (availability(details).open ? (
            <button className="btn-primary" onClick={() => requestBook(details)}>
              <Icon name="bookmark_add" className="text-[18px]" /> Pedir Emprestado
            </button>
          ) : (
            <span className="btn bg-surface-container text-secondary">Indisponível no momento</span>
          ))
        }
      />
      <RequestModal slug={slug} book={requesting} onClose={() => setRequesting(null)} />
    </div>
  );
}
