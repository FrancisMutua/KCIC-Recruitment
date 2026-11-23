import { advertLines, advertRows, advertFields } from "../lib/jobAdvert";

function AdvertSection({ title, rows }) {
  const lines = advertLines(rows);
  if (!lines.length) return null;
  return <section className="space-y-3">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <ol className="list-decimal space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-6 pl-10 text-slate-700 marker:font-semibold marker:text-brand-green-600">
      {lines.map((line, index) => <li key={`${index}-${line}`} className="whitespace-pre-wrap pl-1">{line}</li>)}
    </ol>
  </section>;
}

export default function JobAdvertContent({ details }) {
  const job = details.jobInfo;
  const fields = advertFields(job).filter(([, value]) => value !== "");
  const allowances = advertRows(job.allowanceDetails).filter((row) => (row.Description ?? row.description ?? "").trim());
  return <div className="space-y-8">
    <dl className="grid gap-4 rounded-xl border border-brand-green-100 bg-brand-green-50/70 p-5 sm:grid-cols-2">
      {fields.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-brand-green-700">{label}</dt><dd className="mt-0.5 whitespace-pre-wrap font-medium text-slate-900">{value}</dd></div>)}
    </dl>
    {job.purpose?.trim() && <section><h3 className="mb-3 text-lg font-semibold text-slate-900">Job purpose / description</h3><p className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/60 p-6 leading-relaxed text-slate-700">{job.purpose}</p></section>}
    <AdvertSection title="Key Responsibilities" rows={details.responsibilities} />
    <AdvertSection title="Requirements" rows={details.requirements} />
    <AdvertSection title="Competencies and Skills" rows={details.competencies} />
    <AdvertSection title="Required Documents" rows={advertRows(job.requiredDocuments)} />
    <AdvertSection title="Application Questions" rows={advertRows(job.questions)} />
    {!!allowances.length && <section><h3 className="text-lg font-semibold mb-3">Allowance breakdown</h3><ul className="space-y-2">{allowances.map((row, index) => <li key={row.LineNo ?? index}>{row.Description ?? row.description} — {row.Quantity ?? row.quantity ?? ""}</li>)}</ul></section>}
  </div>;
}
