import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Lê BACKEND_URL e GOOGLE_CLIENT_ID (sem prefixo VITE_) do ambiente de build,
// como Vercel ou docker build. Os nomes VITE_* continuam aceitos.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = (env.BACKEND_URL || env.VITE_API_URL || "").trim().replace(/\/+$/, "");

  if (command === "build" && !backendUrl) {
    throw new Error(
      "BACKEND_URL não definido. Configure a URL da API no ambiente de build (ex.: BACKEND_URL=https://sua-api.onrender.com)."
    );
  }

  return {
    plugins: [react()],
    define: {
      __BACKEND_URL__: JSON.stringify(backendUrl || "http://localhost:3000"),
      __GOOGLE_CLIENT_ID__: JSON.stringify(env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || ""),
    },
  };
});
