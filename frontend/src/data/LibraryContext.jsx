import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Api } from "../API/api";
import { isOverdue } from "../lib/loans";

const LibraryContext = createContext(null);
const POLL_MS = 30_000;
const BASE_TITLE = document.title;

// Livros e empréstimos do dono, compartilhados entre as telas. Recarrega ao voltar
// para a aba e a cada 30s, para pedidos feitos na vitrine aparecerem sem F5.
export function LibraryProvider({ children }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState();
  const [bookings, setBookings] = useState();
  const knownPending = useRef(null);

  const reloadBooks = useCallback(
    ({ silent = false } = {}) =>
      Api.books
        .readAll()
        .then(setBooks)
        .catch((error) => !silent && toast.error(error.message)),
    []
  );
  const reloadBookings = useCallback(
    ({ silent = false } = {}) =>
      Api.bookings
        .readAll()
        .then(setBookings)
        .catch((error) => !silent && toast.error(error.message)),
    []
  );
  // Empréstimo muda o status do livro, então recarrega os dois.
  const reloadAll = useCallback(
    (options) => Promise.all([reloadBooks(options), reloadBookings(options)]),
    [reloadBooks, reloadBookings]
  );

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && reloadAll({ silent: true });
    const timer = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [reloadAll]);

  // Avisa sobre pedidos que chegaram depois da primeira carga.
  useEffect(() => {
    if (!bookings) return;
    const pending = bookings.filter((b) => b.bookingStatus === "pending");
    if (knownPending.current) {
      pending
        .filter((b) => !knownPending.current.has(b._id))
        .forEach((b) =>
          toast.info(`Novo pedido: ${b.bookingName} quer “${b.name}”. Toque para ver.`, {
            autoClose: 8000,
            onClick: () => navigate("/emprestimos?aba=pendentes"),
          })
        );
    }
    knownPending.current = new Set(pending.map((b) => b._id));
  }, [bookings, navigate]);

  const value = useMemo(() => {
    const pendingCount = bookings?.filter((b) => b.bookingStatus === "pending").length ?? 0;
    const overdueCount = bookings?.filter(isOverdue).length ?? 0;
    return {
      books,
      bookings,
      loading: books === undefined || bookings === undefined,
      pendingCount,
      attentionCount: pendingCount + overdueCount,
      reloadBooks,
      reloadAll,
    };
  }, [books, bookings, reloadBooks, reloadAll]);

  useEffect(() => {
    document.title = value.pendingCount ? `(${value.pendingCount}) ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [value.pendingCount]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  return useContext(LibraryContext);
}
