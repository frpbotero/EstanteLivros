const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/";
const TOKEN_KEY = "estante.token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

let token = readToken();

export const session = {
  hasToken: () => Boolean(token),
  set(value) {
    token = value;
    try {
      localStorage.setItem(TOKEN_KEY, value);
    } catch {
      // sem localStorage a sessão vale só até recarregar a página
    }
  },
  clear() {
    token = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignora
    }
  },
  onExpired: null,
};

async function http(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(baseUrl + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor", 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && auth) session.onExpired?.();
    throw new ApiError(data.message || "Erro inesperado", response.status);
  }
  return data;
}

function crud(resource) {
  return {
    readAll: () => http(resource),
    readByID: (id) => http(`${resource}/${id}`),
    create: (body) => http(resource, { method: "POST", body }),
    update: (id, body) => http(`${resource}/${id}`, { method: "PUT", body }),
    remove: (id) => http(`${resource}/${id}`, { method: "DELETE" }),
  };
}

export const Api = {
  auth: {
    login: (body) => http("auth/login", { method: "POST", body, auth: false }),
    register: (body) => http("auth/register", { method: "POST", body, auth: false }),
    google: (idToken) =>
      http("auth/google", { method: "POST", body: { idToken }, auth: false }),
    me: () => http("auth/me"),
  },
  books: crud("livros"),
  bookings: crud("reservas"),
  public: {
    library: (slug) => http(`public/${slug}`, { auth: false }),
    book: (slug, body) =>
      http(`public/${slug}/reservas`, { method: "POST", body, auth: false }),
  },
  // Capa é imutável por versão (updatedAt): o navegador cacheia indefinidamente.
  coverUrl: (book) =>
    book?.hasCover
      ? `${baseUrl}capa/${book._id}?v=${new Date(book.updatedAt).getTime()}`
      : null,
};
