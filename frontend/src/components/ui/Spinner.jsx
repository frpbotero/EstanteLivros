export function Spinner({ label = "Carregando…" }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-secondary" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-surface-container-high border-t-primary-container" />
      <span className="text-body-sm">{label}</span>
    </div>
  );
}
