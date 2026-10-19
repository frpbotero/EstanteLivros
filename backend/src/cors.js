const cors = require("cors");

function normalize(origin) {
  return origin.trim().replace(/\/+$/, "").toLowerCase();
}

// "https://*.vercel.app" vira regex; demais entradas comparam exato.
function toMatcher(entry) {
  const value = normalize(entry);
  if (!value.includes("*")) return (origin) => origin === value;
  const pattern = value.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[a-z0-9-]+");
  const regex = new RegExp(`^${pattern}$`);
  return (origin) => regex.test(origin);
}

// FRONTEND_ORIGIN: lista separada por vírgula, aceita curinga e ignora "/" final.
function corsMiddleware(setting) {
  const entries = (setting || "").split(",").map((entry) => entry.trim()).filter(Boolean);
  if (!entries.length) {
    console.warn("FRONTEND_ORIGIN não definido: CORS aberto.");
    return cors();
  }

  const matchers = entries.map(toMatcher);
  console.log(`CORS liberado para: ${entries.join(", ")}`);

  return cors({
    origin(origin, callback) {
      // Requisições sem Origin (curl, health check, <img>) não passam por CORS.
      if (!origin || matchers.some((match) => match(normalize(origin)))) {
        return callback(null, true);
      }
      console.warn(`CORS bloqueado para origem ${origin}. Ajuste FRONTEND_ORIGIN.`);
      callback(null, false);
    },
  });
}

module.exports = { corsMiddleware };
