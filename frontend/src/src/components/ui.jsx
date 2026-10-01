import { avatarColors, initials } from "../lib/format.js";

export function GoogleMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.74-4.59L2.53 13.22C.91 16.46 0 20.12 0 24c0 3.88.91 7.54 2.53 10.78l7.99-6.19z" />
      <path fill="#EA4335" d="M24 48c6.45 0 11.86-2.14 15.82-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.09 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.99 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function Avatar({ name = "?", size = 40, ring = false }) {
  const [bg, fg] = avatarColors(name);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${ring ? "ring-2 ring-white" : ""}`}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

export function Icon({ name, filled = false, size = 20, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded ${filled ? "fill" : ""} ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-hairline border-t-google-blue" />
      {label}
    </span>
  );
}

export function SkeletonCard() {
  return (
    <div className="g-card animate-fade-in p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
    </div>
  );
}

export function EmptyState({ icon = "forum", title = "Nothing here yet", body = "", action = null }) {
  return (
    <div className="g-card flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-container">
        <Icon name={icon} size={28} className="text-primary" />
      </span>
      <h3 className="mt-4 text-[17px] font-medium text-ink">{title}</h3>
      {body ? <p className="mt-1 max-w-sm text-sm text-muted">{body}</p> : null}
      {action}
    </div>
  );
}

export function Alert({ kind = "error", children }) {
  const styles =
    kind === "error"
      ? "border-[#f5c6c2] bg-[#fce8e6] text-[#a50e0e]"
      : "border-[#ceead6] bg-[#e6f4ea] text-[#137333]";
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${styles}`} role="alert">
      <Icon name={kind === "error" ? "error" : "check_circle"} size={19} />
      <span className="leading-5">{children}</span>
    </div>
  );
}
