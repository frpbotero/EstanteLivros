const { ObjectId } = require("mongodb");

const MAX_COVER_CHARS = 200 * 1024;
const COVER_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const LOAN_DAYS = 21;
const DAY = 24 * 60 * 60 * 1000;

function pick(source, fields) {
  const out = {};
  for (const field of fields) {
    if (source && source[field] !== undefined) out[field] = source[field];
  }
  return out;
}

function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Retorna mensagem de erro ou null se a capa for válida (ou vazia).
function coverError(cover) {
  if (cover === undefined || cover === "") return null;
  if (typeof cover !== "string" || !COVER_PATTERN.test(cover)) {
    return "Capa deve ser uma imagem jpeg, png ou webp em base64";
  }
  if (cover.length > MAX_COVER_CHARS) return "Capa muito grande";
  return null;
}

function slugify(text) {
  return (
    String(text)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "biblioteca"
  );
}

function text(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function optionalInt(value, min, max) {
  if (value === "" || value === null) return { value: null };
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return { error: true };
  return { value: number };
}

// Normaliza o corpo de um livro. `partial` aceita só os campos enviados (edição).
function bookPayload(body, { partial = false } = {}) {
  const source = body || {};
  const has = (field) => source[field] !== undefined;
  const data = {};

  for (const [field, label] of [["name", "Título"], ["author", "Autor"]]) {
    if (!partial || has(field)) {
      data[field] = text(source[field], 200);
      if (!data[field]) return { error: `${label} é obrigatório` };
    }
  }
  if (has("publisher")) data.publisher = text(source.publisher, 120);
  if (has("summary")) data.summary = text(source.summary, 2000);

  for (const [field, min, max, label] of [
    ["pages", 1, 20000, "Número de páginas"],
    ["year", 0, 2100, "Ano da edição"],
  ]) {
    if (!has(field)) continue;
    const parsed = optionalInt(source[field], min, max);
    if (parsed.error) return { error: `${label} inválido` };
    data[field] = parsed.value;
  }

  if (has("isbn")) {
    const isbn = text(source.isbn, 20).toUpperCase();
    const digits = isbn.replace(/[^0-9X]/g, "");
    if (isbn && digits.length !== 10 && digits.length !== 13) {
      return { error: "ISBN deve ter 10 ou 13 dígitos" };
    }
    data.isbn = isbn;
  }

  if (has("tags")) {
    if (!Array.isArray(source.tags)) return { error: "Tags inválidas" };
    const tags = [...new Set(source.tags.map((tag) => text(tag, 30)).filter(Boolean))];
    if (tags.length > 10) return { error: "Use no máximo 10 tags" };
    data.tags = tags;
  }

  for (const field of ["available", "isPublic"]) {
    if (has(field)) data[field] = source[field] === true || source[field] === "true";
  }
  if (!partial) {
    data.available ??= true;
    data.isPublic ??= true;
  }

  if (has("coverImage")) {
    const error = coverError(source.coverImage);
    if (error) return { error };
    data.coverImage = source.coverImage;
  }

  return { data };
}

// Prazo informado (precisa ser futuro) ou padrão de 21 dias a partir de agora.
function dueDateFrom(value) {
  if (value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date <= new Date()) return { error: "Prazo inválido" };
    return { value: date };
  }
  return { value: new Date(Date.now() + LOAN_DAYS * DAY) };
}

module.exports = {
  pick,
  toObjectId,
  coverError,
  slugify,
  text,
  bookPayload,
  dueDateFrom,
  LOAN_DAYS,
};
