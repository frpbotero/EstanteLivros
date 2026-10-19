const DAY = 1000 * 60 * 60 * 24;
const full = new Intl.DateTimeFormat("pt-BR");
const short = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

function valid(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = valid(value);
  return date ? full.format(date) : "";
}

// "14 out"
export function formatShort(value) {
  const date = valid(value);
  return date ? short.format(date).replace(".", "") : "";
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Diferença em dias de calendário (to - from).
export function daysBetween(from, to = new Date()) {
  const a = valid(from);
  const b = valid(to);
  if (!a || !b) return 0;
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
}

export function relativeDay(value) {
  const days = daysBetween(value);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

// Valor para <input type="date"> daqui a N dias.
export function dateInputValue(daysFromNow) {
  const date = new Date(Date.now() + daysFromNow * DAY);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 10);
}

// "2024-10-14" -> fim do dia local, para o prazo não vencer no mesmo dia.
export function endOfDayIso(inputValue) {
  return new Date(`${inputValue}T23:59:59`).toISOString();
}
