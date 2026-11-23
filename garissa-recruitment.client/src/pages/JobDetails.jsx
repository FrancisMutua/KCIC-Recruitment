import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { IconArrowLeft, IconShare, IconCalendarEvent, IconUsers, IconHash, IconLoader2, IconSend, IconLock } from "@tabler/icons-react";
import { useModal } from "../context/ModalContext";
import JobAdvertContent from "../components/JobAdvertContent";
import { fixText } from "../lib/jobAdvert";
import { apiFetch, readJson } from "../lib/http";
import { daysUntil, deadlineLabel, formatDate, learnDateOrder } from "../lib/bcDate";
import { getUser, isSignedIn, POST_LOGIN_REDIRECT } from "../lib/session";
import { changeDocumentTitle } from "../scripts/script";
import { Alert, Spinner } from "../components/ui/kit";

const JobDetails = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const requisitionNo = searchParams.get("requisitionNo") || "";
  const navigate = useNavigate();
  const location = useLocation();
  const inApp = location.pathname.startsWith("/app");
  const backTo = inApp ? "/app" : "/#open-positions";
  const { openLogin } = useModal();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/api/job/jobrequirements?jobId=${encodeURIComponent(jobId)}&requisitionNo=${encodeURIComponent(requisitionNo)}`, { signal: controller.signal });
        const result = await readJson(response);
        if (result.success === false) throw new Error(result.message);
        learnDateOrder([result.data?.jobInfo?.startDate, result.data?.jobInfo?.endDate, result.data?.jobInfo?.documentDate]);
        setDetails(result.data);
        changeDocumentTitle(fixText(result.data?.jobInfo?.jobTitle) || "Job details");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [jobId, requisitionNo]);

  const share = async () => {
    const url = `${window.location.origin}/job-details/${encodeURIComponent(jobId)}?requisitionNo=${encodeURIComponent(requisitionNo)}`;
    try {
      if (navigator.share) await navigator.share({ title: fixText(details?.jobInfo?.jobTitle), url });
      else { await navigator.clipboard.writeText(url); toast.success("Job link copied to clipboard"); }
    } catch (err) {
      if (err?.name !== "AbortError") toast.error(err.message || "Could not share the link");
    }
  };

  const apply = async () => {
    if (!isSignedIn()) {
      try { sessionStorage.setItem(POST_LOGIN_REDIRECT, `/app/job-details/${encodeURIComponent(jobId)}?requisitionNo=${encodeURIComponent(requisitionNo)}`); } catch { /* ignore */ }
      openLogin();
      return;
    }
    const documentNo = details?.jobInfo?.documentNo;
    if (!documentNo) { toast.error("This advert has no requisition number, so it cannot be applied for."); return; }
    try {
      setSubmitting(true);
      const response = await apiFetch("/api/job/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getUser()?.accessToken}` },
        body: JSON.stringify({ jobId, requisitionNo: documentNo }),
      });
      const result = await readJson(response);
      if (!result.success) throw new Error(result.message);
      toast.success("Your application is open. Complete each step and submit it before the advert closes.");
      navigate(`/app/application-details/${result.data}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const wrap = inApp ? "" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8";

  if (loading) return <div className={wrap}><Spinner label="Loading job details…" /></div>;

  if (error) {
    return (
      <div className={`${wrap} space-y-4`}>
        <Link to={backTo} className="btn btn-ghost -ml-3"><IconArrowLeft size={18} /> Back to open positions</Link>
        <Alert tone="error" title="This job could not be loaded">{error}</Alert>
      </div>
    );
  }

  const job = details.jobInfo;
  const days = daysUntil(job.endDate);
  const closed = days != null && days < 0;

  return (
    <div className={`${wrap} space-y-6`}>
      <Link to={backTo} className="btn btn-ghost -ml-3"><IconArrowLeft size={18} /> Back to open positions</Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="space-y-6 lg:col-span-2">
          <header className="card overflow-hidden">
            <div className="bg-hero px-6 py-7 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">Ref. {job.documentNo}</p>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">{fixText(job.jobTitle) || "Job details"}</h1>
              <p className="mt-2 text-sm text-white/75">Job ID {jobId}</p>
            </div>
          </header>
          <div className="card card-body">
            <JobAdvertContent details={details} />
          </div>
        </article>

        <aside className="lg:col-span-1">
          <div className="card card-body space-y-5 lg:sticky lg:top-24">
            <div>
              <h2 className="section-title">Key information</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3"><IconCalendarEvent size={18} className="mt-0.5 text-brand-green" /><div><dt className="text-slate-500">Closing date</dt><dd className="font-medium text-slate-900">{formatDate(job.endDate) || "—"} {deadlineLabel(job.endDate) && <span className="text-slate-500">· {deadlineLabel(job.endDate)}</span>}</dd></div></div>
                <div className="flex items-start gap-3"><IconCalendarEvent size={18} className="mt-0.5 text-brand-green" /><div><dt className="text-slate-500">Opened</dt><dd className="font-medium text-slate-900">{formatDate(job.startDate) || "—"}</dd></div></div>
                <div className="flex items-start gap-3"><IconUsers size={18} className="mt-0.5 text-brand-green" /><div><dt className="text-slate-500">Vacancies</dt><dd className="font-medium text-slate-900">{job.vacancy}</dd></div></div>
                <div className="flex items-start gap-3"><IconHash size={18} className="mt-0.5 text-brand-green" /><div><dt className="text-slate-500">Reference</dt><dd className="font-medium text-slate-900">{job.documentNo}</dd></div></div>
              </dl>
            </div>

            {closed ? (
              <Alert tone="warn">This advert has closed and no longer accepts applications.</Alert>
            ) : (
              <div className="space-y-2">
                <button type="button" onClick={apply} disabled={submitting} className="btn btn-primary btn-lg w-full">
                  {submitting ? <IconLoader2 size={18} className="animate-spin" /> : isSignedIn() ? <IconSend size={18} /> : <IconLock size={18} />}
                  {submitting ? "Opening your application…" : isSignedIn() ? "Apply for this position" : "Sign in to apply"}
                </button>
                <p className="text-center text-xs text-slate-500">
                  {isSignedIn() ? "Your progress is saved — you can finish later." : "You'll come straight back here after signing in."}
                </p>
              </div>
            )}

            <button type="button" onClick={share} className="btn btn-outline w-full"><IconShare size={18} /> Share this job</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobDetails;
