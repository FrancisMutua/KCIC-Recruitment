import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { applicationContext, hasDeclared, post, setDeclared, PERMANENT_RECORD_NOTE } from '../../../../lib/recruitmentApi';
import { fixText } from '../../../../lib/jobAdvert';
import { isBlank } from '../../../../lib/applicationValidation';

const inputStyle = 'mt-1 w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 bg-white';
const emptyMembership = { BodyName: '', MembershipNo: '', MembershipDate: '', Status: 1 };

function Memberships({ applicationNo, rows, onSaved, readOnly }) {
  const [form, setForm] = useState(emptyMembership);
  const [busy, setBusy] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const save = async () => {
    if (isBlank(form.BodyName)) return toast.info('Enter the name of the professional body.');
    if (isBlank(form.MembershipNo)) return toast.info('Enter your membership number.');
    if (rows.some((row) => (row.Description || '').toUpperCase() === form.BodyName.trim().toUpperCase())) {
      return toast.error('You have already added a membership for this professional body.');
    }
    if (!window.confirm(`Add membership of ${form.BodyName}? It cannot be removed later.`)) return;
    setBusy(true);
    try {
      await post('add-professional-membership', {
        applicationNo, bodyName: form.BodyName.trim(), membershipNo: form.MembershipNo.trim(),
        membershipDate: form.MembershipDate || null, status: Number(form.Status),
      });
      toast.success('Professional membership added.');
      setForm(emptyMembership);
      onSaved();
    } catch (error) { toast.error(error.message); } finally { setBusy(false); }
  };
  return <section className="space-y-3 border-t pt-6">
    <h3 className="text-lg font-semibold text-slate-800">Professional memberships</h3>
    <p className="text-sm text-slate-600">Add any professional bodies you belong to (optional).</p>
    {rows.length > 0 ? <ul className="space-y-2">{rows.map((row) => <li key={row.Id} className="border rounded-lg p-3">
      <strong>{row.Description}</strong>
      <p className="text-sm text-slate-600">{[row.MembershipNo && `No. ${row.MembershipNo}`, row.MembershipDate && `Since ${row.MembershipDate}`, row.Status].filter(Boolean).join(' · ')}</p>
    </li>)}</ul> : <p className="text-sm text-slate-500 italic">No memberships added.</p>}
    {!readOnly && <div className="grid sm:grid-cols-2 gap-3">
      <label className="text-sm font-medium text-slate-700">Professional body<input className={inputStyle} name="BodyName" maxLength={60} value={form.BodyName} onChange={change} placeholder="e.g. ICPAK" /></label>
      <label className="text-sm font-medium text-slate-700">Membership number<input className={inputStyle} name="MembershipNo" maxLength={50} value={form.MembershipNo} onChange={change} /></label>
      <label className="text-sm font-medium text-slate-700">Member since<input className={inputStyle} type="date" name="MembershipDate" value={form.MembershipDate} onChange={change} /></label>
      <label className="text-sm font-medium text-slate-700">Status<select className={inputStyle} name="Status" value={form.Status} onChange={change}><option value={1}>Active</option><option value={2}>Inactive</option></select></label>
      <p className="sm:col-span-2 text-sm text-brand-brown-600">{PERMANENT_RECORD_NOTE}</p>
      <div className="sm:col-span-2"><button type="button" onClick={save} disabled={busy} className="btn-primary px-4 py-2 rounded-lg">{busy ? 'Saving…' : 'Add membership'}</button></div>
    </div>}
  </section>;
}

export default function RecruitmentRequirements({ applicationNo, onBack, onNext }) {
  const [context, setContext] = useState(null);
  const [declared, setDeclaredState] = useState(() => hasDeclared(applicationNo));
  const [error, setError] = useState('');
  const load = useCallback(() => applicationContext(applicationNo).then(setContext).catch((e) => setError(e.message)), [applicationNo]);
  useEffect(() => { load(); }, [load]);

  const toggleDeclaration = (checked) => { setDeclared(applicationNo, checked); setDeclaredState(checked); };
  const next = () => {
    if (context?.MinimumRequirements?.length && !declared) {
      toast.error('Confirm that you meet the minimum requirements to continue.');
      return;
    }
    onNext();
  };

  if (error) return <p role="alert" className="text-brand-brown-700">{error}</p>;
  if (!context) return <p>Loading job requirements…</p>;
  const requirements = context.MinimumRequirements || [];
  return <div className="space-y-6">
    <h3 className="text-xl font-semibold">Minimum requirements for {fixText(context.JobTitle) || 'this position'}</h3>
    {requirements.length > 0 ? <>
      <ol className="list-decimal pl-8 space-y-2 bg-slate-50 rounded-lg p-6 text-slate-700">
        {requirements.map((row, index) => <li key={`${row.Code}-${index}`}>{fixText(row.Description || row.Code)}</li>)}
      </ol>
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1" checked={declared} disabled={!context.CanEdit} onChange={(e) => toggleDeclaration(e.target.checked)} />
        <span>I confirm that I meet the minimum requirements listed above and that the information in this application is true. <span className="text-brand-brown-600">*</span></span>
      </label>
    </> : <p className="text-slate-600">No minimum requirements are listed for this position.</p>}
    <Memberships applicationNo={applicationNo} rows={context.Memberships || []} onSaved={load} readOnly={!context.CanEdit} />
    <div className="flex justify-between"><button type="button" onClick={onBack} className="px-4 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50">Previous</button><button type="button" onClick={next} className="btn-primary px-5 py-2 rounded-lg">Save and continue</button></div>
  </div>;
}
