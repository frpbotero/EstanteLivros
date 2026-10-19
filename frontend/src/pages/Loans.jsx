import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { reminderText } from "../components/BookCard";
import { ConfirmModal } from "../components/ConfirmModal";
import { LoanModal } from "../components/LoanModal";
import { Cover } from "../components/ui/Cover";
import { Icon } from "../components/ui/Icon";
import { Spinner } from "../components/ui/Spinner";
import { StatCard } from "../components/ui/StatCard";
import { StatusPill } from "../components/ui/StatusPill";
import { useLibrary } from "../data/LibraryContext";
import { useLoanActions } from "../data/useLoanActions";
import { downloadCsv } from "../lib/csv";
import { daysBetween, formatDate, formatShort, relativeDay } from "../lib/dates";
import { bookingStatus, LOAN_DAYS } from "../lib/loans";
import { formatPhone, whatsappLink } from "../lib/share";

const PAGE_SIZE = 6;
const TABS = [
  { id: "ativos", label: "Ativos" },
  { id: "pendentes", label: "Pendentes" },
  { id: "historico", label: "Histórico Completo" },
];

function bookOf(booking) {
  return booking.book ?? { name: booking.name };
}

function days(n) {
  return `${n} ${n === 1 ? "dia" : "dias"}`;
}

function Pill({ booking }) {
  const status = bookingStatus(booking);
  if (status.kind === "overdue") return <StatusPill kind="overdue" icon="error">Atrasado (+{status.days}d)</StatusPill>;
  if (status.kind === "pending") return <StatusPill kind="pending" icon="schedule">Pedido</StatusPill>;
  if (status.kind === "returned") return <StatusPill kind="returned" icon="check_circle">Devolvido</StatusPill>;
  if (status.days <= 3) return <StatusPill kind="loan" icon="schedule">{days(status.days)} rest.</StatusPill>;
  return <StatusPill kind="available" icon="check_circle">No prazo</StatusPill>;
}

function ContactLink({ booking }) {
  const link = whatsappLink(booking.telNumber, reminderText(bookOf(booking).name, booking));
  if (!booking.telNumber) return <span className="text-outline">—</span>;
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-secondary hover:text-primary-container"
      title="Abrir conversa no WhatsApp"
    >
      <Icon name="chat" className="text-[18px] text-primary-container" />
      {formatPhone(booking.telNumber)}
    </a>
  );
}

function ActionCard({ booking, onReturn, onApprove, onDecline }) {
  const status = bookingStatus(booking);
  const book = bookOf(booking);
  const accent = status.kind === "overdue" ? "border-l-tertiary-container" : "border-l-primary-container";

  return (
    <article className={`card flex flex-col gap-4 border-l-4 p-4 ${accent}`}>
      <div className="flex gap-4">
        <Cover book={book} className="w-16 shrink-0 shadow-card" rounded="rounded-md" compact={!book.hasCover} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <Pill booking={booking} />
            {booking.dueDate && <span className="text-label-sm text-secondary">Dev: {formatShort(booking.dueDate)}</span>}
          </div>
          <h3 className="truncate font-serif text-headline-sm">{book.name}</h3>
          {book.author && <p className="truncate text-body-sm text-secondary">{book.author}</p>}
          <p className="mt-1 flex items-center gap-1.5 text-body-md">
            <Icon name="person" className="text-[16px] text-secondary" />
            {booking.bookingName}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3 text-body-sm">
        {status.kind === "pending" ? (
          <>
            <span className="text-secondary">Pedido {relativeDay(booking.bookingDate)}</span>
            <div className="flex gap-2">
              <button className="btn-secondary px-3 py-1.5" onClick={() => onDecline(booking)}>Recusar</button>
              <button className="btn-primary px-3 py-1.5" onClick={() => onApprove(booking)}>
                <Icon name="check" className="text-[18px]" /> Emprestar
              </button>
            </div>
          </>
        ) : (
          <>
            <ContactLink booking={booking} />
            <button className="btn-secondary px-3 py-1.5" onClick={() => onReturn(booking)}>
              <Icon name="check_circle" className="text-[18px]" /> Devolver
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function timeCell(booking) {
  const status = bookingStatus(booking);
  if (status.kind === "pending") return <span className="text-secondary">Solicitado {relativeDay(booking.bookingDate)}</span>;
  if (status.kind === "returned") {
    return <span className={status.late ? "text-tertiary" : "text-secondary"}>Devolvido ({status.days}d)</span>;
  }
  const elapsed = daysBetween(booking.loanDate);
  return status.kind === "overdue" ? (
    <span className="text-tertiary">{days(elapsed)} (+{status.days}d)</span>
  ) : (
    <span>{days(elapsed)}</span>
  );
}

function ReportTable({ rows, page, onPage, total }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (!total) {
    return (
      <div className="card flex flex-col items-center gap-2 p-10 text-center text-secondary">
        <Icon name="receipt_long" className="text-[32px]" />
        Nenhum registro por aqui ainda.
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-body-md">
          <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
            <tr>
              <th className="px-5 py-4 font-semibold">Livro</th>
              <th className="px-3 py-4 font-semibold">Solicitante</th>
              <th className="px-3 py-4 font-semibold">Saída</th>
              <th className="px-3 py-4 font-semibold">Prazo</th>
              <th className="px-5 py-4 font-semibold">Tempo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((booking) => {
              const book = bookOf(booking);
              const overdue = bookingStatus(booking).kind === "overdue";
              return (
                <tr key={booking._id} className="hover:bg-surface-container-low/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Cover book={book} className="w-9 shrink-0" rounded="rounded" compact />
                      <div className="min-w-0">
                        <p className="truncate text-label-lg">{book.name}</p>
                        {book.author && <p className="truncate text-body-sm text-secondary">{book.author}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p>{booking.bookingName}</p>
                    <p className="whitespace-nowrap text-body-sm"><ContactLink booking={booking} /></p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{booking.loanDate ? formatShort(booking.loanDate) : <span className="text-secondary">Aguardando</span>}</td>
                  <td className={`px-3 py-3 whitespace-nowrap ${overdue ? "font-semibold text-tertiary" : ""}`}>{formatShort(booking.dueDate) || "—"}</td>
                  <td className="px-5 py-3">{timeCell(booking)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between gap-3 border-t border-hairline bg-surface-container-low/60 px-5 py-3 text-body-sm text-secondary">
        <span>
          Mostrando <strong className="text-on-surface">{page * PAGE_SIZE + 1}–{Math.min(total, (page + 1) * PAGE_SIZE)}</strong> de{" "}
          <strong className="text-on-surface">{total}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button className="btn-icon h-8 w-8 bg-surface-container-lowest" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Página anterior">
            <Icon name="chevron_left" className="text-[18px]" />
          </button>
          <span className="text-label-md text-on-surface">Página {page + 1} de {pages}</span>
          <button className="btn-icon h-8 w-8 bg-surface-container-lowest" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} aria-label="Próxima página">
            <Icon name="chevron_right" className="text-[18px]" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export function Loans() {
  const { books, bookings, loading } = useLibrary();
  const { approve, giveBack, decline } = useLoanActions();
  const [params, setParams] = useSearchParams();
  const requestedTab = TABS.some((t) => t.id === params.get("aba")) ? params.get("aba") : null;
  const [page, setPage] = useState(0);
  const [returning, setReturning] = useState(null);
  const [approving, setApproving] = useState(null);
  const [declining, setDeclining] = useState(null);

  const groups = useMemo(() => {
    const list = bookings ?? [];
    const active = list
      .filter((b) => b.bookingStatus === "loan")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const pending = list.filter((b) => b.bookingStatus === "pending");
    const returned = list.filter((b) => b.bookingStatus === "devolution");
    const overdue = active.filter((b) => bookingStatus(b).kind === "overdue");
    return { all: list, active, pending, returned, overdue };
  }, [bookings]);

  const stats = useMemo(() => {
    const withDue = groups.returned.filter((b) => b.dueDate);
    const onTime = withDue.filter((b) => new Date(b.devolutionDate) <= new Date(b.dueDate)).length;
    const durations = groups.returned.filter((b) => b.loanDate).map((b) => daysBetween(b.loanDate, b.devolutionDate));
    return {
      efficacy: withDue.length ? Math.round((onTime / withDue.length) * 100) : null,
      average: durations.length ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : null,
    };
  }, [groups]);

  if (loading) return <Spinner label="Carregando empréstimos…" />;

  // Sem aba na URL: abre em Pendentes quando há pedidos e nenhum empréstimo ativo.
  const tab = requestedTab ?? (groups.pending.length && !groups.active.length ? "pendentes" : "ativos");

  const changeTab = (id) => {
    setPage(0);
    setParams(id === "ativos" ? {} : { aba: id }, { replace: true });
  };

  const tableRows = { ativos: groups.active, pendentes: groups.pending, historico: groups.all }[tab];
  const panel = tab === "pendentes" ? groups.pending : groups.active;
  const critical = groups.overdue[0];

  function exportCsv() {
    downloadCsv(
      `emprestimos-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Livro", "Autor", "Solicitante", "Contato", "Status", "Pedido", "Saída", "Prazo", "Devolução"],
      groups.all.map((b) => [
        bookOf(b).name,
        bookOf(b).author,
        b.bookingName,
        b.telNumber,
        { pending: "Pendente", loan: "Emprestado", devolution: "Devolvido" }[b.bookingStatus],
        formatDate(b.bookingDate),
        formatDate(b.loanDate),
        formatDate(b.dueDate),
        formatDate(b.devolutionDate),
      ])
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">Circulação</span>
        <h1 className="font-serif text-headline-lg-mobile text-primary lg:text-headline-lg">Empréstimos & Relatórios</h1>
      </header>

      {critical && (
        <section className="flex flex-col gap-4 rounded-xl bg-status-overdue-bg p-5 shadow-card md:flex-row md:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary">
            <Icon name="warning" className="text-[26px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-tertiary-container px-2.5 py-0.5 text-label-sm uppercase text-on-tertiary">Alerta de devolução</span>
              <span className="text-label-md text-tertiary">+{days(bookingStatus(critical).days)} de atraso</span>
              {groups.overdue.length > 1 && (
                <span className="text-label-md text-tertiary">· {groups.overdue.length} atrasados no total</span>
              )}
            </div>
            <p className="mt-1 font-serif text-headline-sm text-on-surface">
              {bookOf(critical).name} <span className="font-sans text-body-md text-tertiary">com {critical.bookingName}</span>
            </p>
            <p className="text-body-sm text-tertiary">Prazo expirou em {formatDate(critical.dueDate)}.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {critical.telNumber && (
              <a
                className="btn bg-surface-container-lowest text-tertiary shadow-card hover:bg-white"
                href={whatsappLink(critical.telNumber, reminderText(bookOf(critical).name, critical))}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="chat" className="text-[18px]" /> Lembrar no WhatsApp
              </a>
            )}
            <button className="btn bg-tertiary text-on-tertiary hover:bg-tertiary-container" onClick={() => setReturning(critical)}>
              <Icon name="assignment_turned_in" className="text-[18px]" /> Registrar Devolução
            </button>
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Volumes ativos"
          value={groups.active.length}
          unit="em circulação"
          icon="menu_book"
          progress={books.length ? (groups.active.length / books.length) * 100 : 0}
        />
        <StatCard
          label="Atraso ativo"
          value={groups.overdue.length}
          unit="atrasados"
          icon="timer_off"
          tone={groups.overdue.length ? "alert" : "default"}
          progress={groups.active.length ? (groups.overdue.length / groups.active.length) * 100 : 0}
        />
        <StatCard
          label="Eficácia"
          value={stats.efficacy === null ? "—" : `${stats.efficacy}%`}
          unit="devolução no prazo"
          icon="verified"
          progress={stats.efficacy ?? 0}
        />
        <StatCard
          label="Permanência"
          value={stats.average ?? "—"}
          unit="dias de tempo médio"
          icon="calendar_month"
          progress={stats.average ? (stats.average / LOAN_DAYS) * 100 : 0}
        />
      </section>

      <section className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label }) => {
            const count = { ativos: groups.active.length, pendentes: groups.pending.length }[id];
            return (
              <button
                key={id}
                onClick={() => changeTab(id)}
                className={`btn shrink-0 ${tab === id ? "bg-primary-container text-on-primary shadow-card" : "text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                {label}
                {count !== undefined && (
                  <span className={`rounded-full px-1.5 text-label-sm ${tab === id ? "bg-white/20" : "bg-surface-container-high"}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <button className="btn bg-surface-container-lowest text-on-surface shadow-card hover:bg-white" onClick={exportCsv} disabled={!groups.all.length}>
          <Icon name="download" className="text-[18px]" /> Exportar CSV
        </button>
      </section>

      <div className={`grid gap-6 ${tab === "historico" ? "" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]"}`}>
        {tab !== "historico" && (
          <section className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-serif text-headline-md">
                <Icon name={tab === "pendentes" ? "schedule" : "bolt"} className="text-[22px] text-secondary" />
                {tab === "pendentes" ? "Pedidos da Vitrine" : "Painel Rápido de Ação"}
              </h2>
              <span className="rounded-md bg-surface-container-high px-2 py-1 text-label-sm text-secondary">
                {panel.length} {tab === "pendentes" ? "pendentes" : "ativos"}
              </span>
            </header>
            {panel.length === 0 && (
              <div className="card p-6 text-center text-body-md text-secondary">
                {tab === "pendentes" ? "Nenhum pedido aguardando aprovação." : "Nenhum livro emprestado no momento."}
              </div>
            )}
            {panel.map((booking) => (
              <ActionCard
                key={booking._id}
                booking={booking}
                onReturn={setReturning}
                onApprove={setApproving}
                onDecline={setDeclining}
              />
            ))}
          </section>
        )}

        <section className={`flex flex-col gap-4 ${tab === "historico" ? "" : "hidden md:flex"}`}>
          <header className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-headline-md">Relatório Consolidado de Uso</h2>
              <p className="text-body-sm text-secondary">Saídas, prazos de devolução e pedidos da vitrine.</p>
            </div>
            <span className="text-label-md text-primary-container">Exibindo {tableRows.length} registros</span>
          </header>
          <ReportTable
            rows={tableRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
            total={tableRows.length}
            page={page}
            onPage={setPage}
          />
        </section>
      </div>

      <ConfirmModal
        open={Boolean(returning)}
        title="Registrar devolução?"
        message={returning && `Confirmar que ${returning.bookingName} devolveu "${bookOf(returning).name}".`}
        confirmLabel="Registrar devolução"
        danger={false}
        onConfirm={() => giveBack(returning)}
        onClose={() => setReturning(null)}
      />
      <ConfirmModal
        open={Boolean(declining)}
        title="Recusar pedido?"
        message={declining && `O pedido de ${declining.bookingName} para "${bookOf(declining).name}" será removido.`}
        confirmLabel="Recusar pedido"
        onConfirm={() => decline(declining)}
        onClose={() => setDeclining(null)}
      />
      <LoanModal
        book={approving && bookOf(approving)}
        request={approving}
        onClose={() => setApproving(null)}
        onSubmit={({ dueDate }) => approve(approving, dueDate)}
      />
    </div>
  );
}
