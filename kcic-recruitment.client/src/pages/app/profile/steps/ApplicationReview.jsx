import { useEffect, useState } from 'react';
import { applicationContext, hasDeclared, recruitmentRequest, setDeclared, submissionCheck } from '../../../../lib/recruitmentApi';
import { fixText } from '../../../../lib/jobAdvert';
import { isBlank } from '../../../../lib/applicationValidation';

const TRACK = ['Draft', 'Submitted', 'Under review', 'Outcome'];
const stageIndex = (status) => ({ Draft: 0, Submitted: 1, 'Under review': 2, 'Not successful': 3, Successful: 3 }[status] ?? 0);

/** Applicant-facing progress tracker driven by the status Business Central reports. */
export function ApplicationTracker({ status }) {
  const current = stageIndex(status);
  return <ol className="flex flex-wrap gap-2 sm:gap-0 sm:flex-nowrap">
    {TRACK.map((label, index) => {
      const shown = index === 3 && current === 3 ? status : label;
      const state = index < current ? 'done' : index === current ? 'current' : 'todo';
      return <li key={label} className="flex-1 min-w-[7rem]">
        <div className={`h-1.5 rounded ${state === 'todo' ? 'bg-slate-200' : 'bg-brand-green'}`} />
        <p className={`mt-2 text-sm ${state === 'current' ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{shown}</p>
      </li>;
    })}
  </ol>;
}

function Records({ title, rows, columns }) {
  if (!rows?.length) return <section><h3 className="font-semibold">{title}</h3><p className="text-slate-500 text-sm">No records added.</p></section>;
  return <section className="space-y-2"><h3 className="font-semibold">{title}</h3><div className="overflow-auto border rounded-lg"><table className="min-w-full text-sm"><thead><tr>{columns.map(([key, label]) => <th key={key} className="text-left p-3 bg-slate-50">{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || row.Id || index} className="border-t">{columns.map(([key]) => <td key={key} className="p-3 whitespace-pre-wrap">{String(row[key] ?? '')}</td>)}</tr>)}</tbody></table></div></section>;
}

export default function ApplicationReview({ applicationNo, profile, submitted, status, onBack, onSubmit, loading }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [declared, setDeclaredState] = useState(() => hasDeclared(applicationNo));
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

  if (error) return <p role="alert" className="text-red-700">{error}</p>;
  if (!data) return <p>Loading application summary…</p>;
  const { context } = data;
  const readOnly = submitted || !context.CanEdit;
  const requirements = context.JobRequirements || [];
  const missing = [...data.missing, ...(declared ? [] : ['Tick the declaration below.'])];
  const toggleDeclaration = (checked) => { setDeclared(applicationNo, checked); setDeclaredState(checked); };

  return <div className="space-y-7">
    <div className="flex flex-wrap justify-between gap-4"><h2 className="text-xl font-semibold">Application summary</h2><span className="rounded-full bg-brand-green-50 text-brand-green-800 px-3 py-1">{status || context.CandidateStatus}</span></div>
    <ApplicationTracker status={status || context.CandidateStatus} />
    {readOnly && <p className="text-sm text-slate-600">This application has been submitted to the Kenya Climate Innovation Center and can no longer be changed. Its status above updates as HR reviews it.</p>}
    <dl className="grid sm:grid-cols-2 gap-3">{[['Position', fixText(context.JobTitle)], ['Name', [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ')], ['Email', profile.emailAddress], ['ID / Passport', profile.idNumber], ['Phone', profile.phoneNumber], ['Current county of residence', profile.county]].map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd>{isBlank(value) ? '—' : value}</dd></div>)}</dl>
    <Records title="6. Academic / professional / technical qualifications" rows={data.education} columns={[["startDate", "From"], ["endDate", "To"], ["institution", "Institution"], ["description", "Qualification"], ["courseDescription", "Course"], ["areaOfStudy", "Subject"], ["grade", "Class / grade"]]} />
    <Records title="7. Other courses, training and memberships" rows={data.training} columns={[["year", "Year"], ["institution", "Institution / college"], ["description", "Course"], ["trainingDescription", "Details"]]} />
    <Records title="8. Employment details" rows={data.experience} columns={[["startDate", "From"], ["endDate", "To"], ["institution", "Employer"], ["position", "Position"], ["salary", "Gross monthly salary"]]} />
    <Records title="11. Personal references" rows={data.referees} columns={[["names", "Full name"], ["occupation", "Occupation"], ["phoneNo", "Telephone"], ["email", "E-mail"], ["periodKnown", "Known for"]]} />
    <Records title="Documents" rows={data.documents} columns={[["fileName", "Document"], ["documentType", "Type"]]} />
    {!readOnly && requirements.length > 0 && <section className="space-y-3">
      <h3 className="font-semibold">Requirements for this position</h3>
      <ol className="list-decimal pl-8 space-y-1 bg-slate-50 rounded-lg p-5 text-slate-700">{requirements.map((row, index) => <li key={`${row.Code}-${index}`}>{fixText(row.Description || row.Code)}</li>)}</ol>
    </section>}
    {!readOnly && <section className="space-y-3 rounded-lg border border-slate-200 p-5">
      <h3 className="font-semibold">Declaration</h3>
      <label className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={declared} onChange={(e) => toggleDeclaration(e.target.checked)} />
        <span className="space-y-2 text-slate-700">
          <span className="block">I hereby certify to the best of my knowledge that the particulars given on this form are correct and I understand that any incorrect information may lead to disqualification/legal action.</span>
          <span className="block">I further consent that information of personal nature may be obtained from my former employers as listed and or my referees for consideration of my application. <span className="text-red-600">*</span></span>
        </span></label>
    </section>}
    {!readOnly && missing.length > 0 && <div role="alert" className="border border-brand-green-300 bg-brand-green-50 p-4 rounded-lg"><p className="font-semibold">Complete these items before submitting:</p><ul className="list-disc pl-5">{missing.map((message) => <li key={message}>{message}</li>)}</ul></div>}
    {!readOnly && <div className="flex justify-between"><button type="button" onClick={onBack} className="px-4 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50">Previous</button><button type="button" onClick={onSubmit} disabled={loading || missing.length > 0} className="btn-primary px-5 py-2 rounded-lg disabled:opacity-50">{loading ? 'Submitting…' : 'Submit application'}</button></div>}
  </div>;
}
