import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { LibraryProvider, useLibrary } from "../../data/LibraryContext";
import { copyText, publicUrl, shareLink } from "../../lib/share";
import { Avatar } from "../ui/Avatar";
import { Brand, BrandMark } from "../ui/Brand";
import { Icon } from "../ui/Icon";
import { Menu } from "../ui/Menu";

const PAGE_TITLES = {
  "/": "Acervo",
  "/livros/novo": "Novo Livro",
  "/emprestimos": "Empréstimos",
};

function useNavItems() {
  const { user } = useAuth();
  return [
    { to: "/", label: "Acervo Pessoal", short: "Acervo", icon: "menu_book", end: true },
    { to: "/livros/novo", label: "Novo Livro", short: "Novo", icon: "add_circle" },
    { to: "/emprestimos", label: "Empréstimos & Relatórios", short: "Empréstimos", icon: "swap_horizontal_circle", badge: true },
    { to: `/u/${user.slug}`, label: "Vitrine Pública", short: "Público", icon: "public" },
  ];
}

function Badge({ count, className = "" }) {
  if (!count) return null;
  return (
    <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-tertiary-container px-1.5 text-label-sm text-on-tertiary ${className}`}>
      {count > 9 ? "9+" : count}
    </span>
  );
}

function Sidebar() {
  const { user, logout } = useAuth();
  const { attentionCount } = useLibrary();
  const items = useNavItems();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col justify-between bg-surface-container-lowest px-4 py-6 shadow-bar lg:flex">
      <div className="flex flex-col gap-6">
        <div className="px-3">
          <Brand />
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low px-2 py-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-label-sm uppercase text-on-surface-variant">Link público</span>
            <span className="rounded-full bg-secondary-container px-2 py-0.5 text-label-sm text-on-secondary-container">Ativo</span>
          </div>
          <button
            className="flex w-full items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-2.5 py-1.5 text-left transition-colors hover:bg-surface-container-high"
            onClick={() => copyText(publicUrl(user.slug))}
            title="Copiar link público"
          >
            <span className="truncate text-body-sm text-secondary">/u/{user.slug}</span>
            <Icon name="content_copy" className="text-[16px] text-secondary" />
          </button>
        </div>
        <nav className="flex flex-col gap-1.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-label-lg transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary shadow-card"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`
              }
            >
              <Icon name={item.icon} className="text-[20px]" />
              <span className="flex-1">{item.label}</span>
              {item.badge && <Badge count={attentionCount} />}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-2">
        <Avatar name={user.name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-label-md text-on-surface">{user.name}</span>
          <span className="truncate text-body-sm text-secondary">{user.email}</span>
        </div>
        <button className="btn-icon h-8 w-8 hover:text-error" onClick={logout} aria-label="Sair" title="Sair">
          <Icon name="logout" className="text-[18px]" />
        </button>
      </div>
    </aside>
  );
}

function TopSearch() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const onCatalog = pathname === "/";
  const [draft, setDraft] = useState("");
  const value = onCatalog ? params.get("q") ?? "" : draft;

  useEffect(() => {
    if (!onCatalog) setDraft("");
  }, [onCatalog]);

  function change(event) {
    const next = event.target.value;
    if (!onCatalog) return setDraft(next);
    const updated = new URLSearchParams(params);
    if (next) updated.set("q", next);
    else updated.delete("q");
    setParams(updated, { replace: true });
  }

  function submit(event) {
    event.preventDefault();
    if (!onCatalog) navigate(`/?q=${encodeURIComponent(draft)}`);
  }

  return (
    <form onSubmit={submit} className="w-80" role="search">
      <label className="flex w-full items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-on-surface-variant transition-colors focus-within:bg-surface-container-lowest focus-within:ring-[3px] focus-within:ring-primary-container/15">
        <Icon name="search" className="text-[20px] text-secondary" />
        <input
          value={value}
          onChange={change}
          type="search"
          placeholder="Buscar no acervo, autores, ISBN…"
          className="w-full border-none bg-transparent text-body-sm text-on-surface outline-none placeholder:text-outline"
          aria-label="Buscar no acervo"
        />
      </label>
    </form>
  );
}

function DesktopHeader() {
  const { user } = useAuth();
  return (
    <header className="fixed left-64 right-0 top-0 z-40 hidden h-16 items-center justify-between bg-surface/85 px-8 shadow-bar backdrop-blur-xl lg:flex">
      <TopSearch />
      <div className="flex items-center gap-4">
        <span className="text-body-md text-secondary">
          Olá, <strong className="text-label-lg text-on-surface">{user.name}</strong>
        </span>
        <Avatar name={user.name} />
      </div>
    </header>
  );
}

function MobileHeader() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? (pathname.startsWith("/livros") ? "Editar Livro" : "");
  const url = publicUrl(user.slug);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-surface/90 px-4 shadow-bar backdrop-blur-xl lg:hidden">
      <span className="flex items-center gap-3">
        <BrandMark className="h-9 w-9" />
        <span className="flex flex-col leading-tight">
          <span className="font-serif text-headline-sm text-primary">Bookstore</span>
          <span className="text-body-sm text-secondary">{title}</span>
        </span>
      </span>
      <div className="flex items-center gap-1">
        <button className="btn-icon" onClick={() => shareLink({ title: `Estante de ${user.name}`, url })} aria-label="Compartilhar link público">
          <Icon name="share" className="text-[20px]" />
        </button>
        <Menu
          label="Conta"
          triggerClassName="flex items-center gap-2 rounded-xl py-1 pl-2 pr-1 hover:bg-surface-container-high"
          trigger={
            <>
              <span className="flex flex-col items-end leading-tight">
                <span className="text-label-sm uppercase text-secondary">Olá,</span>
                <span className="text-label-md text-on-surface">{user.name.split(" ")[0]}</span>
              </span>
              <Avatar name={user.name} className="h-9 w-9 text-label-md" />
            </>
          }
          items={[
            { label: "Copiar link público", icon: "content_copy", onClick: () => copyText(url) },
            { label: "Sair", icon: "logout", danger: true, onClick: logout },
          ]}
        />
      </div>
    </header>
  );
}

function BottomNav() {
  const { attentionCount } = useLibrary();
  const items = useNavItems();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[72px] grid-cols-4 border-t border-hairline bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center gap-1 text-label-sm ${
              isActive ? "text-primary-container" : "text-on-surface-variant"
            }`
          }
        >
          {item.to === "/livros/novo" ? (
            <span className="-mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-raised">
              <Icon name="add" className="text-[24px]" />
            </span>
          ) : (
            <span className="relative">
              <Icon name={item.icon} className="text-[24px]" />
              {item.badge && <Badge count={attentionCount} className="absolute -right-3 -top-1.5" />}
            </span>
          )}
          {item.short}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell() {
  return (
    <LibraryProvider>
      <Sidebar />
      <DesktopHeader />
      <MobileHeader />
      <main className="min-h-screen px-4 pb-28 pt-5 lg:pl-[18rem] lg:pr-8 lg:pt-24 lg:pb-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </LibraryProvider>
  );
}
