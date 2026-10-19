import { Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import { AuthProvider, RequireAuth } from "./auth/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import { BookForm } from "./pages/BookForm";
import { Catalog } from "./pages/Catalog";
import { Loans } from "./pages/Loans";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { PublicLibrary } from "./pages/PublicLibrary";

const googleClientId = __GOOGLE_CLIENT_ID__;

export function App() {
  const routes = (
    <AuthProvider>
      <Routes>
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<Catalog />} />
          <Route path="livros/novo" element={<BookForm />} />
          <Route path="livros/:id/editar" element={<BookForm />} />
          <Route path="emprestimos" element={<Loans />} />
        </Route>
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/edit" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/u/:slug" element={<PublicLibrary />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );

  return (
    <>
      {googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{routes}</GoogleOAuthProvider> : routes}
      <ToastContainer position="top-center" autoClose={3500} hideProgressBar newestOnTop theme="light" />
    </>
  );
}
