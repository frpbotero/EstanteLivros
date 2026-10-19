import { Link } from "react-router-dom";
import { Icon } from "../components/ui/Icon";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-secondary">
        <Icon name="menu_book" className="text-[32px]" />
      </span>
      <h1 className="font-serif text-headline-lg">Página não encontrada</h1>
      <p className="text-body-md text-secondary">Este endereço não leva a nenhuma estante.</p>
      <Link to="/" className="btn-primary">Voltar ao início</Link>
    </div>
  );
}
