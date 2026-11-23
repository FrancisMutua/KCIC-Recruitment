import { IconCircleCheck, IconPointFilled } from "@tabler/icons-react";
import { advertLines, advertRows } from "../lib/jobAdvert";

function AdvertSection({ title, rows, check = false }) {
  const lines = advertLines(rows);
  if (!lines.length) return null;
  const Icon = check ? IconCircleCheck : IconPointFilled;
  return (
    <section className="space-y-3">
      <h2 className="section-title">{title}</h2>
      <ul className="space-y-2.5">
        {lines.map((line, index) => (
          <li key={`${index}-${line}`} className="flex gap-3 text-slate-700">
            <Icon size={check ? 20 : 14} className={`shrink-0 text-brand-green ${check ? "mt-0.5" : "mt-1.5"}`} />
            <span className="whitespace-pre-wrap">{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function JobAdvertContent({ details }) {
  const job = details.jobInfo;
  return (
    <div className="space-y-8">
      {job.purpose?.trim() && (
        <section className="space-y-3">
          <h2 className="section-title">About the role</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{job.purpose}</p>
        </section>
      )}
      <AdvertSection title="Key responsibilities" rows={details.responsibilities} />
      <AdvertSection title="Requirements" rows={details.requirements} check />
      <AdvertSection title="Competencies and skills" rows={details.competencies} check />
      <AdvertSection title="Documents you will need" rows={advertRows(job.requiredDocuments)} />
    </div>
  );
}
