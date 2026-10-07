import { advertLines, advertRows, advertFields } from "../lib/jobAdvert";

function AdvertSection({ title, rows }) {
  const lines = advertLines(rows);
  if (!lines.length) return null;
  return <section className="space-y-3">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <ol className="list-decimal pl-8 space-y-2 bg-gray-50 rounded-lg p-6 text-gray-700">
      {lines.map((line, index) => <li key={`${index}-${line}`} className="whitespace-pre-wrap pl-1">{line}</li>)}
    </ol>
  </section>;
}

export default function JobAdvertContent({ details }) {
  const job = details.jobInfo;
  const fields = advertFields(job);
  const allowances = advertRows(job.allowanceDetails).filter((row) => (row.Description ?? row.description ?? "").trim());
  return <div className="space-y-8">
    <dl className="grid sm:grid-cols-2 gap-4 rounded-lg bg-blue-50 p-5">
      {fields.map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="whitespace-pre-wrap">{value}</dd></div>)}
    </dl>
    {job.purpose?.trim() && <section><h3 className="text-lg font-semibold mb-3">Job purpose / description</h3><p className="whitespace-pre-wrap bg-gray-50 rounded-lg p-6">{job.purpose}</p></section>}
    <AdvertSection title="Key Responsibilities" rows={details.responsibilities} />
    <AdvertSection title="Requirements" rows={details.requirements} />
    <AdvertSection title="Competencies and Skills" rows={details.competencies} />
    <AdvertSection title="Required Documents" rows={advertRows(job.requiredDocuments)} />
    <AdvertSection title="Application Questions" rows={advertRows(job.questions)} />
    {!!allowances.length && <section><h3 className="text-lg font-semibold mb-3">Allowance breakdown</h3><ul className="space-y-2">{allowances.map((row, index) => <li key={row.LineNo ?? index}>{row.Description ?? row.description} — {row.Quantity ?? row.quantity ?? ""}</li>)}</ul></section>}
  </div>;
}
