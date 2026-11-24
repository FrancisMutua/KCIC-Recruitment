import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";
import { load, post, remove } from "../../lib/recruitmentApi";
import { Field, StepNavigation } from "./Field";
import { isShown, validateFields } from "../../lib/fieldRules";

/**
 * A repeating section of the application (qualifications, work experience, next of kin, referees):
 * an "add" form, the saved rows from Business Central, and a remove button per row.
 *
 * config: { title, intro, listPath, addPath, deletePath(row) → "path?query", rowKey(row),
 *           fields, columns: [[key, label, format?]], toPayload(values), dateRange, minimum, minimumLabel,
 *           confirmAdd(values) → text }
 */
export default function RecordStep({ applicationNo, config, onBack, onNext }) {
  const empty = () => Object.fromEntries(config.fields.map((f) => [f.name, f.type === "checkbox" || f.type === "yesno" ? false : ""]));
  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});

  const refresh = useCallback(async () => {
    setFetching(true);
    try {
      setRows(await load(config.listPath, applicationNo) || []);
    } catch (error) {
      toast.error(error.message || `Could not load ${config.title.toLowerCase()}.`);
    } finally {
      setFetching(false);
    }
  }, [applicationNo, config.listPath, config.title]);

  useEffect(() => { refresh(); }, [refresh]);

  const change = (name, value) => {
    setErrors((prev) => {
      if (!prev[name] && !["startDate", "endDate", "isCurrent"].includes(name)) return prev;
      const next = { ...prev };
      delete next[name];
      if (["startDate", "endDate", "isCurrent"].includes(name)) { delete next.startDate; delete next.endDate; }
      return next;
    });
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const add = async (event) => {
    event.preventDefault();
    const visible = config.fields.filter((field) => isShown(field, values));
    const found = { ...validateFields(visible, values, { dateRange: config.dateRange }), ...(config.validate?.(values) || {}) };
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    const question = config.confirmAdd?.(values);
    if (question && !window.confirm(question)) return;

    setSaving(true);
    try {
      await post(config.addPath, { applicationNo, ...config.toPayload(values) });
      toast.success(`${config.itemLabel} added`);
      setValues(empty());
      setErrors({});
      await refresh();
    } catch (error) {
      toast.error(error.message || `Could not add the ${config.itemLabel.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (row) => {
    if (!window.confirm(`Remove this ${config.itemLabel.toLowerCase()} from your application?`)) return;
    setSaving(true);
    try {
      await remove(config.deletePath(row, applicationNo));
      toast.success(`${config.itemLabel} removed`);
      await refresh();
    } catch (error) {
      toast.error(error.message || `Could not remove the ${config.itemLabel.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const shortBy = Math.max(0, (config.minimum || 0) - rows.length);
  const next = () => {
    if (shortBy > 0) {
      toast.error(`Add ${shortBy} more ${shortBy === 1 ? config.itemLabel.toLowerCase() : config.minimumLabel} to continue (minimum ${config.minimum}).`);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} noValidate>
        <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-green-600" /> Add {config.itemLabel}
        </h3>
        {config.intro && <p className="text-sm text-slate-600 mb-4">{config.intro}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.fields.filter((field) => isShown(field, values)).map((field) =>
            <Field key={field.name} field={field} value={values[field.name]} error={errors[field.name]} onChange={change} disabled={saving} />)}
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50">
            {saving ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {saving ? "Saving…" : `Add ${config.itemLabel}`}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">My {config.title}</h3>
          {config.minimum > 0 && <p className={`text-sm ${shortBy ? "text-red-600" : "text-slate-500"}`}>{rows.length} of minimum {config.minimum}</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                {config.columns.map(([key, label]) =>
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</th>)}
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {fetching ? (
                <tr><td colSpan={config.columns.length + 1} className="px-6 py-10 text-center">
                  <span className="inline-flex items-center gap-2 text-slate-500"><IconLoader2 className="animate-spin" /> Loading…</span>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={config.columns.length + 1} className="px-6 py-10 text-center text-slate-500 italic">
                  No {config.title.toLowerCase()} added yet.
                </td></tr>
              ) : rows.map((row) => (
                <tr key={config.rowKey(row)} className="hover:bg-brand-green-50/40 transition-colors">
                  {config.columns.map(([key, , format]) =>
                    <td key={key} className="px-6 py-4 text-sm text-slate-600 align-top whitespace-pre-wrap">{format ? format(row) : String(row[key] ?? "")}</td>)}
                  <td className="px-6 py-4 text-center align-top">
                    <button type="button" onClick={() => removeRow(row)} disabled={saving}
                      className="text-red-600 hover:text-red-700 transition-colors p-1 disabled:opacity-50" title="Remove">
                      <IconTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StepNavigation onBack={onBack} onNext={next} busy={saving} />
    </div>
  );
}
