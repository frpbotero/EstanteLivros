import { Icon } from "./Icon";

export function BrandMark({ className = "h-10 w-10" }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary ${className}`}>
      <Icon name="local_library" className="text-[22px]" />
    </span>
  );
}

export function Brand({ subtitle = "Biblioteca Pessoal" }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark />
      <span className="flex flex-col leading-tight">
        <span className="font-serif text-headline-sm text-primary">Bookstore</span>
        {subtitle && (
          <span className="text-label-sm uppercase tracking-wider text-secondary">{subtitle}</span>
        )}
      </span>
    </span>
  );
}
