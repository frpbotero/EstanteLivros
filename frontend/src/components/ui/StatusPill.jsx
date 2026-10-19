import { Icon } from "./Icon";

const STYLES = {
  available: "bg-status-available-bg text-status-available",
  loan: "bg-status-loan-bg text-status-loan",
  pending: "bg-status-pending-bg text-status-pending",
  overdue: "bg-status-overdue-bg text-status-overdue",
  unavailable: "bg-status-pending-bg text-status-pending",
  returned: "bg-status-available-bg text-status-available",
};

export function StatusPill({ kind, children, icon, className = "" }) {
  return (
    <span className={`pill ${STYLES[kind]} ${className}`}>
      {icon ? (
        <Icon name={icon} className="text-[12px]" />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
}
