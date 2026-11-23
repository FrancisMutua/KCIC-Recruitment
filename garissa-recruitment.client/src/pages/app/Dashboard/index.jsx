import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconBriefcase, IconFileText, IconSend, IconPencil, IconArrowRight, IconUserCheck, IconSearch } from "@tabler/icons-react";
import StatCard from "./components/StatCard";
import JobTable from "../../../components/JobTable";
import { apiFetch, readJson, resultError } from "../../../lib/http";
import { recruitmentRequest } from "../../../lib/recruitmentApi";
import { displayName, getUser } from "../../../lib/session";
import { fixText } from "../../../lib/jobAdvert";
import { formatDate } from "../../../lib/bcDate";
import { Alert, Card, StatusBadge } from "../../../components/ui/kit";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function NextStep({ applications, profileComplete }) {
  const draft = applications.find((app) => !app.Submitted);
  if (!profileComplete) {
    return (
      <div className="card flex flex-col gap-4 border-brand-gold bg-brand-gold-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <IconUserCheck size={24} className="mt-0.5 shrink-0 text-brand-brown-600" />
          <div>
            <p className="font-semibold text-slate-900">Complete your profile first</p>
            <p className="text-sm text-slate-600">Your phone, date of birth, gender and address are copied onto every application you start.</p>
          </div>
        </div>
        <Link to="/app/profile-update" className="btn btn-primary shrink-0">Complete profile <IconArrowRight size={16} /></Link>
      </div>
    );
  }
  if (draft) {
    return (
      <div className="card flex flex-col gap-4 border-brand-green-200 bg-brand-green-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <IconPencil size={24} className="mt-0.5 shrink-0 text-brand-green-600" />
          <div>
            <p className="font-semibold text-slate-900">Finish your application for {fixText(draft.JobTitle) || draft.JobId}</p>
            <p className="text-sm text-slate-600">It hasn't been sent to Garissa University yet. Submit it before the advert closes.</p>
          </div>
        </div>
        <Link to={`/app/application-details/${draft.DocumentNo}`} className="btn btn-primary shrink-0">Continue application <IconArrowRight size={16} /></Link>
      </div>
    );
  }
  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <IconSearch size={24} className="mt-0.5 shrink-0 text-brand-green-600" />
        <div>
          <p className="font-semibold text-slate-900">Looking for your next role?</p>
          <p className="text-sm text-slate-600">Browse the positions currently open at Garissa University.</p>
        </div>
      </div>
      <Link to="/app/jobs" className="btn btn-outline shrink-0">Browse open positions</Link>
    </div>
  );
}

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [statsResponse, apps] = await Promise.all([
          apiFetch("/api/dashboard/statistics", { headers: { Authorization: `Bearer ${user?.accessToken}` } }),
          recruitmentRequest("applications"),
        ]);
        const data = await readJson(statsResponse);
        if (!statsResponse.ok || data.success === false) throw new Error(resultError(data, statsResponse));
        if (!active) return;
        setStats(data.data);
        setApplications(apps || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.accessToken]);

  const name = displayName().split(" ")[0];
  const drafts = applications.filter((app) => !app.Submitted).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">{greeting()}{name ? `, ${name}` : ""}</h1>
        <p className="page-subtitle">Here's where your job applications stand.</p>
      </div>

      {error && <Alert tone="error" title="Some of your information couldn't be loaded">{error}</Alert>}

      {!loading && !error && <NextStep applications={applications} profileComplete={user?.isProfileUpdated !== false} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard loading={loading} title="Open positions" value={stats?.totalOpenings} icon={IconBriefcase} tone="green" />
        <StatCard loading={loading} title="My applications" value={stats?.totalApplications} icon={IconFileText} tone="lime" />
        <StatCard loading={loading} title="Submitted" value={stats?.submittedApplications} icon={IconSend} tone="green" />
        <StatCard loading={loading} title="Drafts to finish" value={loading ? undefined : drafts} icon={IconPencil} tone="gold" />
      </div>

      {applications.length > 0 && (
        <Card title="Recent applications" bodyClassName="" actions={<Link to="/app/applications" className="text-sm font-semibold text-brand-green-700 hover:underline">View all</Link>}>
          <ul className="divide-y divide-slate-100">
            {applications.slice(0, 4).map((app) => (
              <li key={app.DocumentNo}>
                <Link to={`/app/application-details/${app.DocumentNo}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{fixText(app.JobTitle) || app.JobId}</p>
                    <p className="text-xs text-slate-500">{app.DocumentNo} · Started {formatDate(app.DocumentDate)}</p>
                  </div>
                  <StatusBadge status={app.CandidateStatus} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <JobTable basePath="/app/job-details" compact />
    </div>
  );
};

export default Dashboard;
