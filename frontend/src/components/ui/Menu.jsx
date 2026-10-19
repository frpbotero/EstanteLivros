import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export function Menu({ label = "Mais opções", items, trigger, triggerClassName = "btn-icon h-8 w-8" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (event) => !ref.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className={triggerClassName}
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-expanded={open}
      >
        {trigger ?? <Icon name="more_vert" className="text-[20px]" />}
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 min-w-44 overflow-hidden rounded-xl bg-surface-container-lowest py-1 shadow-raised">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-body-md hover:bg-surface-container-low ${
                item.danger ? "text-status-overdue" : "text-on-surface"
              }`}
            >
              <Icon name={item.icon} className="text-[18px]" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
