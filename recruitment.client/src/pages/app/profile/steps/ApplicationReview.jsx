import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { applicationAction, applicationContext, recruitmentRequest, saveDownload } from '../../../../lib/recruitmentApi';
import Attachments from './Attachments';

function Records({ title, rows, columns }) {
  if (!rows?.length) return <section><h3 className="font-semibold">{title}</h3><p className="text-gray-500 text-sm">No records added.</p></section>;
  return <section className="space-y-2"><h3 className="font-semibold">{title}</h3><div className="overflow-auto border rounded-lg"><table className="min-w-full text-sm"><thead><tr>{columns.map(([key, label]) => <th key={key} className="text-left p-3 bg-gray-50">{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.LineNo || row.lineNo || index} className="border-t">{columns.map(([key]) => <td key={key} className="p-3 whitespace-pre-wrap">{String(row[key] ?? row[key[0].toLowerCase() + key.slice(1)] ?? '')}</td>)}</tr>)}</tbody></table></div></section>;
}

export default function ApplicationReview({ applicationNo, profile, submitted, onBack, onSubmit, loading }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const load = useCallback(async () => {
    const suffix = `?applicationNo=${encodeURIComponent(applicationNo)}`;
    const [context, education, experience, training, referees, documents] = await Promise.all([
      applicationContext(applicationNo), ...['academic-qualifications', 'work-experience', 'professional-training', 'referees', 'attached-documents'].map((path) => recruitmentRequest(path + suffix)),
    ]);
    setData({ context, education, experience, training, referees, documents });
  }, [applicationNo]);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);
  const act = async (action) => {
    setBusy(true);
    try {
      if (action === 'accept-offer') await recruitmentRequest(`accept-offer?applicationNo=${encodeURIComponent(applicationNo)}`, { method: 'POST' });
      else {
        const result = await applicationAction(applicationNo, action, { Reason: reason });
        if (action === 'download-offer') { saveDownload(result); return; }
      }
      await load();
      toast.success('Application updated.');
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  if (error) return <p role="alert" className="text-red-700">{error}</p>;
  if (!data) return <p>Loading application summary…</p>;
  const { context } = data;
  const warnings = context.Warnings || [];
  const readOnly = submitted || !context.CanEdit;
  return <div className="space-y-7">
    <div className="flex justify-between gap-4"><h2 className="text-xl font-semibold">Application summary</h2><span className="rounded-full bg-blue-50 text-blue-800 px-3 py-1">{context.CandidateStatus}</span></div>
    <dl className="grid sm:grid-cols-2 gap-3">{[['Name', [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ')], ['Email', profile.emailAddress], ['ID / Passport', profile.idNumber], ['Phone', profile.phoneNumber], ['Ethnicity', profile.ethnicity], ['Current county of residence', profile.county], ['Expected salary', profile.expectedSalary], ['Graduated', context.HasGraduated ? 'Yes' : 'No']].map(([label, value]) => <div key={label}><dt className="text-sm text-gray-500">{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
    <Records title="Academic qualifications" rows={data.education} columns={[["Description", "Level"], ["CourseDescription", "Course"], ["Institution", "Institution"], ["AreaOfStudy", "Area of study"], ["Grade", "Grade"]]} />
    <Records title="Work experience" rows={data.experience} columns={[["Position", "Position"], ["Institution", "Employer"], ["StartDate", "From"], ["EndDate", "To"]]} />
    <Records title="Professional qualifications" rows={data.training} columns={[["Description", "Qualification / training"], ["Institution", "Institution"], ["Year", "Year attained"]]} />
    <Records title="Professional memberships" rows={context.Memberships} columns={[["Description", "Body"], ["MembershipNo", "Membership number"], ["Year", "Year"]]} />
    <Records title="Referees" rows={data.referees} columns={[["FirstName", "First name"], ["LastName", "Last name"], ["Institution", "Institution"], ["Email", "Email"]]} />
    <Records title="Minimum requirements" rows={(context.MinimumRequirements || []).map((row) => ({ ...row, Answer: Number(row.Has) === 2 ? 'Yes' : Number(row.Has) === 1 ? 'No' : 'Not answered' }))} columns={[["Description", "Requirement"], ["Answer", "Your answer"]]} />
    <Records title="Job questions" rows={context.Questions} columns={[["Description", "Question"], ["Answer", "Your answer"]]} />
    {context.AcademicJob && <><Records title="Publications" rows={context.Publications} columns={[["Description", "Publication"], ["Link", "Link"], ["Year", "Year"]]} /><Records title="Students supervised" rows={context.Supervisions} columns={[["Description", "Programme / level"], ["Quantity", "Students"], ["Institution", "Institution"]]} /></>}
    <Records title="Documents" rows={data.documents} columns={[["FileName", "Document"], ["DocumentType", "Category"], ["RequirementCode", "Advert requirement"]]} />
    <p className="text-sm">Data consent: {context.DataConsent ? 'Given' : 'Not given'} · Reference-check consent: {context.ReferenceConsent ? 'Given' : 'Not given'}</p>
    {!readOnly && warnings.length > 0 && <div className="border border-amber-300 bg-amber-50 p-4 rounded-lg"><p className="font-semibold">{context.EnforceCompleteness ? 'Complete these items before submitting:' : 'Please review these items:'}</p><ul className="list-disc pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
    {!readOnly && <div className="flex justify-between"><button type="button" onClick={onBack} className="px-4 py-2 rounded bg-gray-200">Previous</button><button type="button" onClick={onSubmit} disabled={loading || (context.EnforceCompleteness && warnings.length > 0)} className="btn-primary px-5 py-2 rounded disabled:opacity-50">{loading ? 'Submitting…' : 'Submit application'}</button></div>}
    {context.OfferAvailable && <section className="space-y-4 border-t pt-5"><h3 className="font-semibold">Offer of employment</h3><p>Respond by: {context.AcceptanceDeadline || 'As stated in the letter'}</p><button type="button" onClick={() => act('download-offer')} disabled={busy} className="btn-primary px-4 py-2 rounded">Download offer letter</button>
      {context.CanRespondToOffer && context.OfferAcceptanceMode === 'Signed Letter Upload' && <Attachments applicationNo={applicationNo} signedOffer onUpdated={load} />}
      {context.CanRespondToOffer && <div className="flex gap-3"><button type="button" onClick={() => act('accept-offer')} disabled={busy} className="bg-green-700 text-white px-4 py-2 rounded">Accept offer</button><button type="button" onClick={() => act('decline-offer')} disabled={busy} className="border border-red-700 text-red-700 px-4 py-2 rounded">Decline offer</button></div>}
    </section>}
    {context.CanWithdraw && <section className="space-y-3 border-t pt-5"><h3 className="font-semibold">Withdraw application</h3><label className="block">Reason (optional)<input value={reason} onChange={(e) => setReason(e.target.value)} className="border p-2 rounded w-full" /></label><button type="button" onClick={() => act('withdraw')} disabled={busy} className="border border-red-700 text-red-700 px-4 py-2 rounded">Withdraw this application</button></section>}
  </div>;
}
