import { Icon } from "./Icon";

export function StatCard({ label, value, unit, icon, footer, tone = "default", progress }) {
  const alert = tone === "alert";
  return (
    <div className="card relative overflow-hidden p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-label-sm uppercase tracking-wider ${alert ? "text-tertiary" : "text-secondary"}`}>
          {label}
        </span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            alert ? "bg-status-overdue-bg text-status-overdue" : "bg-surface-container-low text-primary-container"
          }`}
        >
          <Icon name={icon} className="text-[18px]" />
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`font-serif text-headline-lg-mobile font-bold sm:text-headline-lg ${alert ? "text-tertiary" : "text-on-surface"}`}>
          {value}
        </span>
        {unit && <span className="text-body-sm text-secondary">{unit}</span>}
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-container">
          <div
            className={`h-full rounded-full ${alert ? "bg-tertiary-container" : "bg-primary-container"}`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
      {footer && <div className="mt-3 text-label-sm text-secondary">{footer}</div>}
      <span className="pointer-events-none absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-primary/5" />
    </div>
  );
}
