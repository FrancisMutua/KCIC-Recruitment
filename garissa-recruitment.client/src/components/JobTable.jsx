import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { IconSearch, IconShare, IconCalendarEvent, IconUsers, IconArrowRight, IconBriefcaseOff, IconRefresh } from "@tabler/icons-react";
import { fixText } from "../lib/jobAdvert";
import { apiFetch, readJson } from "../lib/http";
import { daysUntil, deadlineLabel, formatDate, learnDateOrder } from "../lib/bcDate";
import { Alert, EmptyState, Spinner } from "./ui/kit";

function DeadlineBadge({ endDate }) {
  const days = daysUntil(endDate);
  const label = deadlineLabel(endDate);
  if (!label) return null;
  const tone = days < 0 ? "badge-gray" : days <= 3 ? "badge-brown" : days <= 7 ? "badge-gold" : "badge-green";
  return <span className={`badge ${tone}`}>{label}</span>;
}

const JobTable = ({ basePath = "/job-details", compact = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/job/advertisedjobs", { signal: controller.signal });
        const result = await readJson(response);
        if (result.success === false) throw new Error(result.message);
        learnDateOrder((result.data ?? []).flatMap((job) => [job.startDate, job.endDate, job.documentDate]));
        setJobs(result.data ?? []);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reload]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const sorted = [...jobs].sort((a, b) => (daysUntil(a.endDate) ?? 9999) - (daysUntil(b.endDate) ?? 9999));
    if (!term) return sorted;
    return sorted.filter((job) => [job.jobTitle, job.jobId, job.documentNo].some((v) => fixText(v).toLowerCase().includes(term)));
  }, [jobs, query]);

  const share = async (job) => {
    const url = `${window.location.origin}/job-details/${encodeURIComponent(job.jobId)}?requisitionNo=${encodeURIComponent(job.documentNo)}`;
    try {
      if (navigator.share) await navigator.share({ title: fixText(job.jobTitle), url });
      else { await navigator.clipboard.writeText(url); toast.success("Job link copied to clipboard"); }
    } catch (err) {
      if (err?.name !== "AbortError") toast.error(err.message || "Could not share the link");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={compact ? "section-title" : "text-2xl font-bold sm:text-3xl"}>Open positions</h2>
          {!loading && !error && (
            <p className="mt-1 text-sm text-slate-500">
              {jobs.length === 0 ? "No positions are open right now." : `${jobs.length} position${jobs.length === 1 ? "" : "s"} accepting applications`}
            </p>
          )}
        </div>
        {jobs.length > 3 && (
          <div className="relative w-full sm:w-72">
            <label htmlFor="job-search" className="sr-only">Search positions</label>
            <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="job-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or reference" className="field-input pl-10" />
          </div>
        )}
      </div>

      {loading && <Spinner label="Loading open positions…" />}

      {!loading && error && (
        <Alert tone="error" title="We couldn't load the open positions">
          <p>{error}</p>
          <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => setReload((n) => n + 1)}>
            <IconRefresh size={16} /> Try again
          </button>
        </Alert>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="card">
          <EmptyState
            icon={IconBriefcaseOff}
            title={query ? "No positions match your search" : "No open positions at the moment"}
            description={query ? "Try a different job title or reference number." : "New vacancies are published here as soon as they are approved. Please check back soon."}
            action={query && <button type="button" className="btn btn-outline" onClick={() => setQuery("")}>Clear search</button>}
          />
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((job) => {
            const href = `${basePath}/${encodeURIComponent(job.jobId)}?requisitionNo=${encodeURIComponent(job.documentNo)}`;
            return (
              <li key={`${job.documentNo}-${job.jobId}`} className="card group relative flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-green-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-medium text-slate-500">Ref. {job.documentNo}</span>
                  <DeadlineBadge endDate={job.endDate} />
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-900">
                  <Link to={href} className="after:absolute after:inset-0 after:rounded-2xl group-hover:text-brand-green-700">
                    {fixText(job.jobTitle) || job.jobId}
                  </Link>
                </h3>
                <dl className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><IconCalendarEvent size={16} className="text-slate-400" /><dt className="sr-only">Closing date</dt><dd>Closes {formatDate(job.endDate) || "—"}</dd></div>
                  <div className="flex items-center gap-2"><IconUsers size={16} className="text-slate-400" /><dt className="sr-only">Vacancies</dt><dd>{job.vacancy} {Number(job.vacancy) === 1 ? "vacancy" : "vacancies"}</dd></div>
                </dl>
                <div className="relative z-10 mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <Link to={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green-700 hover:gap-2 transition-all">
                    View details & apply <IconArrowRight size={16} />
                  </Link>
                  <button type="button" onClick={() => share(job)} className="btn btn-ghost btn-sm" aria-label={`Share ${fixText(job.jobTitle)}`}>
                    <IconShare size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default JobTable;
