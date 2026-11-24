import GlobalDropdown from "../ui/GlobalDropdown";
import { inputClass } from "../../lib/fieldRules";

export function Field({ field, value, error, onChange, disabled }) {
  const id = `field-${field.name}`;
  const label = (
    <span className="block text-sm font-medium text-slate-700">
      {field.label} {field.required && <span className="text-red-600">*</span>}
    </span>
  );
  const message = error ? <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">{error}</p>
    : field.hint ? <p className="mt-1 text-xs text-slate-500">{field.hint}</p> : null;
  const common = {
    id, name: field.name, disabled, "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  const wrap = (control) => <div className={field.full || field.type === "textarea" ? "md:col-span-2 lg:col-span-3" : ""}>{control}</div>;

  if (field.type === "lookup") {
    return wrap(<GlobalDropdown source="SOAP" type={field.lookupType} label={field.label} name={field.name}
      value={value ?? ""} onChange={(val) => onChange(field.name, val)} required={field.required} error={error} disabled={disabled} />);
  }
  if (field.type === "checkbox") {
    return wrap(<label className="flex items-start gap-3 cursor-pointer select-none">
      <input type="checkbox" className="mt-1" checked={!!value} onChange={(e) => onChange(field.name, e.target.checked)} {...common} />
      <span className="text-sm text-slate-700">{field.label}</span>
    </label>);
  }
  if (field.type === "yesno") {
    return wrap(<label htmlFor={id}>{label}
      <select value={value === true ? "true" : value === false ? "false" : ""} onChange={(e) => onChange(field.name, e.target.value === "true")}
        className={inputClass(error)} {...common}>
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>{message}</label>);
  }
  if (field.type === "select") {
    return wrap(<label htmlFor={id}>{label}
      <select value={value ?? ""} onChange={(e) => onChange(field.name, e.target.value)} className={inputClass(error)} {...common}>
        <option value="">{field.placeholder || `Select ${field.label}`}</option>
        {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>{message}</label>);
  }
  if (field.type === "textarea") {
    return wrap(<label htmlFor={id}>{label}
      <textarea rows={field.rows || 4} value={value ?? ""} maxLength={field.maxLength} placeholder={field.placeholder}
        onChange={(e) => onChange(field.name, e.target.value)} className={inputClass(error)} {...common} />
      {field.maxLength && <p className="text-xs text-slate-400 mt-1">{String(value ?? "").length}/{field.maxLength}</p>}
      {message}</label>);
  }
  return wrap(<label htmlFor={id}>{label}
    <input type={field.type || "text"} value={value ?? ""} maxLength={field.maxLength} placeholder={field.placeholder}
      min={field.min} max={field.max} step={field.step} inputMode={field.type === "tel" ? "tel" : undefined}
      onChange={(e) => onChange(field.name, e.target.value)} className={inputClass(error)} {...common} />
    {message}</label>);
}

export function StepNavigation({ onBack, onNext, nextLabel = "Next Step", busy, nextDisabled }) {
  return <div className="flex justify-between pt-6">
    {onBack ? <button type="button" onClick={onBack}
      className="border border-slate-300 bg-white text-slate-700 font-semibold px-6 py-2 rounded-lg hover:border-brand-green hover:bg-brand-green-50 hover:text-brand-green-700 transition-colors">
      Previous
    </button> : <span />}
    <button type="button" onClick={onNext} disabled={busy || nextDisabled}
      className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50">
      {busy ? "Saving…" : nextLabel}
    </button>
  </div>;
}
