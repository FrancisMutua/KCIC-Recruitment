import { useEffect, useState } from 'react';
import { IconCheck, IconCircleCheck, IconAlertTriangle, IconLoader2, IconSend } from '@tabler/icons-react';
import { applicationContext, hasDeclared, recruitmentRequest, submissionCheck } from '../../../../lib/recruitmentApi';
import { fixText } from '../../../../lib/jobAdvert';
import { isBlank } from '../../../../lib/applicationValidation';
import { formatDate } from '../../../../lib/bcDate';
import { Alert, Spinner } from '../../../../components/ui/kit';

const TRACK = ['Draft', 'Submitted', 'Under review', 'Outcome'];
const stageIndex = (status) => ({ Draft: 0, Submitted: 1, 'Under review': 2, 'Not successful': 3, Closed: 3 }[status] ?? 0);

/** Applicant-facing progress tracker driven by the status Business Central reports. */
export function ApplicationTracker({ status }) {
  const current = stageIndex(status);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Application progress">
      {TRACK.map((label, index) => {
        const shown = index === 3 && current === 3 ? status : label;
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="min-w-0" aria-current={active ? 'step' : undefined}>
            <div className={`h-1.5 rounded-full ${done || active ? 'bg-brand-green' : 'bg-slate-200'}`} />
            <p className={`mt-2 flex items-center gap-1 truncate text-xs sm:text-sm ${active ? 'font-semibold text-slate-900' : done ? 'text-slate-600' : 'text-slate-400'}`}>
              {done && <IconCheck size={14} className="shrink-0 text-brand-green" />}{shown}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const DATE_KEYS = new Set(['startDate', 'endDate', 'MembershipDate']);
const display = (key, value) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return DATE_KEYS.has(key) && text ? formatDate(text) : text;
};

function Records({ title, rows, columns }) {
  const count = rows?.length || 0;
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <header className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="badge badge-gray">{count}</span>
      </header>
      {count === 0 ? (
        <p className="px-4 py-4 text-sm italic text-slate-400">None added.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead><tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={row.id || row.Id || index}>{columns.map(([key]) => <td key={key} className="whitespace-pre-wrap">{display(key, row[key]) || '—'}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ApplicationReview({ applicationNo, profile, submitted, status, onBack, onSubmit, loading }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const suffix = `?applicationNo=${encodeURIComponent(applicationNo)}`;
    Promise.all([
      applicationContext(applicationNo),
      ...['academic-qualifications', 'work-experience', 'professional-training', 'referees', 'attached-documents'].map((path) => recruitmentRequest(path + suffix)),
      submitted ? Promise.resolve([]) : submissionCheck(applicationNo),
    ]).then(([context, education, experience, training, referees, documents, missing]) => {
      if (active) setData({ context, education, experience, training, referees, documents, missing });
    }).catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, [applicationNo, submitted]);

  if (error) return <Alert tone="error" title="The summary couldn't be loaded">{error}</Alert>;
  if (!data) return <Spinner label="Checking your application…" />;
  const { context } = data;
  const readOnly = submitted || !context.CanEdit;
  const needsDeclaration = (context.MinimumRequirements || []).length > 0 && !hasDeclared(applicationNo);
  const missing = [...data.missing, ...(needsDeclaration ? ['Confirm that you meet the minimum requirements in the Requirements & Memberships step.'] : [])];
  const currentStatus = status || context.CandidateStatus;

  const confirmSubmit = () => {
    if (window.confirm('Submit this application to Garissa University? You won\'t be able to change it afterwards.')) onSubmit();
  };

  return (
    <div className="space-y-6">
      {readOnly ? (
        <div className="space-y-4">
          <h2 className="section-title">Application progress</h2>
          <ApplicationTracker status={currentStatus} />
          <Alert tone="info">This application has been submitted and can no longer be changed. The status above updates as HR reviews it.</Alert>
        </div>
      ) : missing.length > 0 ? (
        <Alert tone="warn" title={`${missing.length} item${missing.length === 1 ? '' : 's'} to complete before you can submit`}>
          <ul className="mt-1 list-disc space-y-1 pl-5">{missing.map((message) => <li key={message}>{message}</li>)}</ul>
        </Alert>
      ) : (
        <div className="alert alert-info"><IconCircleCheck size={20} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Your application is ready to submit</p><p>Check the summary below, then submit it to Garissa University.</p></div></div>
      )}

      <dl className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {[['Position', fixText(context.JobTitle)], ['Name', [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ')], ['Email', profile.emailAddress], ['ID / passport', profile.idNumber], ['Phone', profile.phoneNumber], ['County of residence', profile.county]].map(([label, value]) => (
          <div key={label} className="min-w-0"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{isBlank(value) ? '—' : value}</dd></div>
        ))}
      </dl>

      <div className="grid gap-4">
        <Records title="Academic qualifications" rows={data.education} columns={[["code", "Level"], ["description", "Course"], ["institution", "Institution"], ["areaOfStudy", "Area of study"], ["grade", "Grade"]]} />
        <Records title="Work experience" rows={data.experience} columns={[["position", "Position"], ["institution", "Employer"], ["startDate", "From"], ["endDate", "To"]]} />
        <Records title="Professional qualifications" rows={data.training} columns={[["description", "Qualification / training"], ["institution", "Institution"], ["year", "Year"]]} />
        <Records title="Professional memberships" rows={context.Memberships} columns={[["Description", "Body"], ["MembershipNo", "Membership number"], ["Status", "Status"]]} />
        <Records title="Referees" rows={data.referees} columns={[["names", "Name"], ["institution", "Institution"], ["email", "Email"], ["phoneNo", "Phone"]]} />
        <Records title="Documents" rows={data.documents} columns={[["fileName", "Document"], ["documentType", "Type"]]} />
      </div>

      {!readOnly && (
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
          <button type="button" onClick={onBack} className="btn btn-outline">Previous</button>
          <button type="button" onClick={confirmSubmit} disabled={loading || missing.length > 0} className="btn btn-primary btn-lg">
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : missing.length ? <IconAlertTriangle size={18} /> : <IconSend size={18} />}
            {loading ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      )}
    </div>
  );
}
