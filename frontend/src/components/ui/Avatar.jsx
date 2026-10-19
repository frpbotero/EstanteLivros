function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts.at(-1)[0] : "")).toUpperCase() || "?";
}

export function Avatar({ name, className = "h-8 w-8 text-label-md" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-sans text-on-primary ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
