import { useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import { Brand, BrandMark } from "../components/ui/Brand";
import { Icon } from "../components/ui/Icon";

const googleEnabled = Boolean(__GOOGLE_CLIENT_ID__);

function Showcase() {
  return (
    <section className="relative hidden overflow-hidden rounded-[28px] bg-gradient-to-br from-surface-container-low via-surface-container-low to-secondary-container/50 p-12 lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center justify-between">
        <Brand subtitle="Acervo & Empréstimos" />
        <span className="flex items-center gap-2 rounded-full bg-surface-container-lowest/70 px-3 py-1.5 text-label-md text-on-surface">
          <span className="h-2 w-2 rounded-full bg-primary-container" /> Edição digital curada
        </span>
      </div>

      <div className="my-12">
        <p className="mb-3 text-label-lg uppercase tracking-wider text-secondary">Gestão de bibliotecas & coleções</p>
        <h1 className="font-serif text-[44px] font-semibold leading-[1.15] tracking-tight text-on-surface">
          O santuário dos seus livros, compartilhado com elegância.
        </h1>
        <p className="mt-6 max-w-xl text-body-lg text-on-surface-variant">
          Abandone as planilhas. Organize seus títulos físicos, empreste com confiança a amigos e mantenha um catálogo refinado na web.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-6">
          <Icon name="library_books" className="text-[28px] text-primary-container" />
          <p className="mt-4 font-serif text-headline-md">Catálogo completo</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">Capa, ISBN, editora e gêneros de cada exemplar em um só lugar.</p>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <Icon name="public" className="text-[28px] text-primary-container" />
            <span className="rounded-full bg-surface-container px-2.5 py-1 text-label-sm text-on-surface-variant">Link pessoal</span>
          </div>
          <p className="mt-4 flex items-center gap-2 font-serif text-headline-md">/u/seu-nome</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">Página pública para amigos navegarem e pedirem livros emprestados.</p>
        </div>
      </div>

      <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-body-md text-on-surface-variant">
        {[
          ["verified", "Prazos e alertas de atraso"],
          ["chat", "Lembretes pelo WhatsApp"],
          ["sync_saved_locally", "Sem necessidade de planilhas"],
        ].map(([icon, text]) => (
          <li key={text} className="flex items-center gap-2">
            <Icon name={icon} className="text-[20px] text-primary-container" /> {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Login() {
  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("modo") === "cadastro" ? "register" : "login");
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const target = location.state?.from?.pathname || "/";

  if (user) return <Navigate to={target} replace />;

  const set = (key) => (event) => setFields((current) => ({ ...current, [key]: event.target.value }));

  async function attempt(action) {
    setBusy(true);
    try {
      await action();
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    attempt(() =>
      mode === "login" ? login({ email: fields.email, password: fields.password }) : register(fields)
    );
  }

  const registering = mode === "register";

  return (
    <div className="grid min-h-screen gap-8 p-4 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
      <Showcase />

      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-3 pt-4 text-center lg:hidden">
          <span className="rounded-3xl bg-surface-container p-3">
            <BrandMark className="h-14 w-14" />
          </span>
          <h1 className="font-serif text-headline-xl-mobile">Bookstore</h1>
          <p className="text-body-lg text-on-surface-variant">Sua biblioteca pessoal e controle de empréstimos</p>
          <span className="flex items-center gap-2 rounded-full bg-secondary-container px-4 py-1.5 text-label-md text-on-secondary-container">
            <Icon name="menu_book" className="text-[18px]" /> Curadoria & organização literária
          </span>
        </div>

        <section className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-raised">
          <div className="flex flex-col gap-6 p-6 sm:p-10">
            <div className="hidden lg:block">
              <span className="eyebrow">Portal de acesso</span>
              <h2 className="mt-1 font-serif text-headline-lg">Bem-vindo ao Bookstore</h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Entre para gerenciar seu acervo ou crie seu espaço em instantes.
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-xl bg-surface-container-low p-1" role="tablist">
              {[
                ["login", "Entrar"],
                ["register", "Criar Conta"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => setMode(id)}
                  className={`rounded-lg py-2.5 text-label-lg transition-colors ${
                    mode === id ? "bg-primary-container text-on-primary shadow-card" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {googleEnabled && (
              <>
                <div className="flex justify-center [&>div]:w-full">
                  <GoogleLogin
                    onSuccess={({ credential }) => attempt(() => loginWithGoogle(credential))}
                    onError={() => toast.error("Não foi possível entrar com o Google")}
                    text="continue_with"
                    size="large"
                    width="360"
                    locale="pt-BR"
                  />
                </div>
                <div className="flex items-center gap-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                  <span className="h-px flex-1 bg-hairline" /> ou com e-mail <span className="h-px flex-1 bg-hairline" />
                </div>
              </>
            )}

            <form onSubmit={submit} className="flex flex-col gap-5">
              {registering && (
                <div>
                  <label className="field-label normal-case tracking-normal text-body-md text-on-surface" htmlFor="auth-name">Nome</label>
                  <div className="field">
                    <Icon name="person" />
                    <input id="auth-name" value={fields.name} onChange={set("name")} placeholder="Como quer aparecer na vitrine" autoComplete="name" required />
                  </div>
                </div>
              )}
              <div>
                <label className="field-label normal-case tracking-normal text-body-md text-on-surface" htmlFor="auth-email">E-mail</label>
                <div className="field">
                  <Icon name="mail" />
                  <input id="auth-email" type="email" value={fields.email} onChange={set("email")} placeholder="voce@email.com" autoComplete="email" required />
                </div>
              </div>
              <div>
                <label className="field-label normal-case tracking-normal text-body-md text-on-surface" htmlFor="auth-password">
                  Senha
                  {registering && <span className="text-body-sm text-secondary">mínimo de 6 caracteres</span>}
                </label>
                <div className="field">
                  <Icon name="lock" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={fields.password}
                    onChange={set("password")}
                    placeholder={registering ? "Crie uma senha segura" : "Sua senha"}
                    autoComplete={registering ? "new-password" : "current-password"}
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="flex text-secondary" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary h-12 text-body-lg" disabled={busy}>
                {busy ? "Aguarde…" : registering ? "Criar minha estante" : "Entrar no Bookstore"}
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
            </form>
          </div>
          <p className="bg-surface-container-low px-6 py-4 text-center text-body-sm text-on-surface-variant sm:px-10">
            {registering ? "Já tem conta? " : "Ainda não tem conta? "}
            <button className="font-semibold text-primary-container hover:underline" onClick={() => setMode(registering ? "login" : "register")}>
              {registering ? "Entrar" : "Criar agora"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
