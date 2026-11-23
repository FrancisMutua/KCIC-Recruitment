import { IconAlertTriangle, IconInfoCircle, IconLoader2, IconCircleX } from "@tabler/icons-react";

/** Page title + optional subtitle and actions. */
export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-green-600">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = "", bodyClassName = "card-body" }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Spinner({ label = "Loading…", className = "" }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-10 text-sm text-slate-500 ${className}`}>
      <IconLoader2 className="animate-spin text-brand-green" size={22} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-50 text-brand-green-600">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const ALERT_ICONS = { info: IconInfoCircle, warn: IconAlertTriangle, error: IconCircleX };

export function Alert({ tone = "info", title, children, className = "" }) {
  const Icon = ALERT_ICONS[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`alert alert-${tone} ${className}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="break-words">{children}</div>
      </div>
    </div>
  );
}

const STATUS_TONES = {
  Draft: "badge-gold",
  Submitted: "badge-green",
  "Under review": "badge-lime",
  "Not successful": "badge-brown",
  Closed: "badge-gray",
};

export function StatusBadge({ status }) {
  const label = status || "Draft";
  return <span className={`badge ${STATUS_TONES[label] || "badge-green"}`}>{label}</span>;
}

/** Label + control + error/hint, wired for screen readers via ids. */
export function Field({ id, label, required, error, hint, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="required-mark" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={id ? `${id}-error` : undefined} role="alert" className="field-error">{error}</p>
      ) : hint ? (
        <p id={id ? `${id}-hint` : undefined} className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

/** Read-only label/value pair. */
export function Detail({ label, value }) {
  const empty = value == null || String(value).trim() === "";
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 break-words text-sm ${empty ? "italic text-slate-400" : "font-medium text-slate-900"}`}>{empty ? "Not provided" : value}</dd>
    </div>
  );
}
