import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IconArrowRight, IconFileOff, IconRefresh } from "@tabler/icons-react";
import { recruitmentRequest } from "../../lib/recruitmentApi";
import { fixText } from "../../lib/jobAdvert";
import { formatDate } from "../../lib/bcDate";
import { Alert, EmptyState, PageHeader, Spinner, StatusBadge } from "../../components/ui/kit";
import { ApplicationTracker } from "./profile/steps/ApplicationReview";

const FILTERS = [
  ["all", "All"],
  ["draft", "Drafts"],
  ["submitted", "Submitted"],
];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    recruitmentRequest("applications")
      .then((data) => { if (active) { setApplications(data || []); setError(""); } })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [reload]);

  const visible = useMemo(() => applications.filter((app) =>
    filter === "all" ? true : filter === "draft" ? !app.Submitted : app.Submitted), [applications, filter]);

  const counts = { all: applications.length, draft: applications.filter((a) => !a.Submitted).length, submitted: applications.filter((a) => a.Submitted).length };

  return (
    <div className="space-y-6">
      <PageHeader title="My applications" subtitle="Drafts are only visible to you until you submit them."
        actions={<Link to="/app/jobs" className="btn btn-primary">Find another position</Link>} />

      {applications.length > 0 && (
        <div role="tablist" aria-label="Filter applications" className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {FILTERS.map(([key, label]) => (
            <button key={key} role="tab" aria-selected={filter === key} type="button" onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === key ? "bg-brand-green-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
              {label} <span className={filter === key ? "text-white/80" : "text-slate-400"}>({counts[key]})</span>
            </button>
          ))}
        </div>
      )}

      {loading && <Spinner label="Loading your applications…" />}

      {!loading && error && (
        <Alert tone="error" title="Your applications couldn't be loaded">
          <p>{error}</p>
          <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => { setLoading(true); setReload((n) => n + 1); }}><IconRefresh size={16} /> Try again</button>
        </Alert>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="card">
          <EmptyState icon={IconFileOff}
            title={applications.length ? "Nothing in this view" : "You haven't applied for anything yet"}
            description={applications.length ? "Try a different filter." : "Find a position that suits you and start your application — you can save and finish it later."}
            action={!applications.length && <Link to="/app/jobs" className="btn btn-primary">Browse open positions</Link>} />
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <ul className="space-y-4">
          {visible.map((app) => (
            <li key={app.DocumentNo} className="card card-body">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={app.CandidateStatus} />
                    <span className="text-xs text-slate-500">Application {app.DocumentNo}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">{fixText(app.JobTitle) || app.JobId}</h2>
                  <p className="text-sm text-slate-500">Ref. {app.ReferenceNo} · Started {formatDate(app.DocumentDate)}</p>
                </div>
                <Link to={`/app/application-details/${app.DocumentNo}`} className={`btn shrink-0 ${app.Submitted ? "btn-outline" : "btn-primary"}`}>
                  {app.Submitted ? "View application" : "Continue application"} <IconArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <ApplicationTracker status={app.CandidateStatus} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Applications;
