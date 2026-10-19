import { daysBetween } from "./dates";

export const LOAN_DAYS = 21;

export function shortName(name = "") {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0]}.` : first;
}

// Situação de um livro do dono, derivada das reservas em aberto.
export function bookStatus(book) {
  const active = book.activeBookings ?? [];
  const loan = active.find((booking) => booking.bookingStatus === "loan");
  const pending = active.filter((booking) => booking.bookingStatus === "pending");

  if (loan) {
    const left = daysBetween(new Date(), loan.dueDate);
    return left < 0
      ? { kind: "overdue", loan, days: -left, pending }
      : { kind: "loan", loan, days: left, pending };
  }
  if (book.available === false) return { kind: "unavailable", pending };
  return { kind: "available", pending };
}

// Situação de uma reserva/empréstimo.
export function bookingStatus(booking) {
  if (booking.bookingStatus === "pending") return { kind: "pending" };
  if (booking.bookingStatus === "devolution") {
    const late = booking.dueDate && new Date(booking.devolutionDate) > new Date(booking.dueDate);
    return { kind: "returned", late, days: daysBetween(booking.loanDate, booking.devolutionDate) };
  }
  const left = daysBetween(new Date(), booking.dueDate);
  return left < 0 ? { kind: "overdue", days: -left } : { kind: "loan", days: left };
}

export function isOverdue(booking) {
  return bookingStatus(booking).kind === "overdue";
}
