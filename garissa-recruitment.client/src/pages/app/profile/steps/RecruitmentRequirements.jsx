import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { applicationContext, hasDeclared, post, setDeclared, PERMANENT_RECORD_NOTE } from '../../../../lib/recruitmentApi';
import { fixText } from '../../../../lib/jobAdvert';
import { isBlank } from '../../../../lib/applicationValidation';
import { IconCircleCheck } from '@tabler/icons-react';
import { Alert, Spinner } from '../../../../components/ui/kit';

const inputStyle = 'field-input';
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
  return <section className="space-y-4 border-t border-slate-100 pt-6">
    <div>
      <h3 className="section-title">Professional memberships <span className="text-sm font-normal text-slate-500">(optional)</span></h3>
      <p className="text-sm text-slate-500">Add any professional bodies you belong to.</p>
    </div>
    {rows.length > 0 ? <ul className="grid gap-3 sm:grid-cols-2">{rows.map((row) => <li key={row.Id} className="rounded-xl border border-slate-200 p-4">
      <p className="font-semibold text-slate-900">{row.Description}</p>
      <p className="mt-1 text-sm text-slate-500">{[row.MembershipNo && `No. ${row.MembershipNo}`, row.MembershipDate && `Since ${row.MembershipDate}`].filter(Boolean).join(' · ')}</p>
      {row.Status && <span className={`badge mt-2 ${row.Status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{row.Status}</span>}
    </li>)}</ul> : <p className="text-sm italic text-slate-400">No memberships added.</p>}
    {!readOnly && <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
      <div><label htmlFor="m-body" className="field-label">Professional body</label><input id="m-body" className={inputStyle} name="BodyName" maxLength={60} value={form.BodyName} onChange={change} placeholder="e.g. ICPAK" /></div>
      <div><label htmlFor="m-no" className="field-label">Membership number</label><input id="m-no" className={inputStyle} name="MembershipNo" maxLength={50} value={form.MembershipNo} onChange={change} /></div>
      <div><label htmlFor="m-date" className="field-label">Member since</label><input id="m-date" className={inputStyle} type="date" name="MembershipDate" value={form.MembershipDate} onChange={change} /></div>
      <div><label htmlFor="m-status" className="field-label">Status</label><select id="m-status" className={inputStyle} name="Status" value={form.Status} onChange={change}><option value={1}>Active</option><option value={2}>Inactive</option></select></div>
      <p className="text-xs text-slate-500 sm:col-span-2">{PERMANENT_RECORD_NOTE}</p>
      <div className="sm:col-span-2"><button type="button" onClick={save} disabled={busy} className="btn btn-outline">{busy ? 'Saving…' : 'Add membership'}</button></div>
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

  if (error) return <Alert tone="error" title="The requirements couldn't be loaded">{error}</Alert>;
  if (!context) return <Spinner label="Loading job requirements…" />;
  const requirements = context.MinimumRequirements || [];
  return <div className="space-y-6">
    <h3 className="section-title">Minimum requirements for {fixText(context.JobTitle) || 'this position'}</h3>
    {requirements.length > 0 ? <>
      <ul className="space-y-2.5 rounded-xl border border-slate-200 p-5">
        {requirements.map((row, index) => <li key={`${row.Code}-${index}`} className="flex gap-3 text-slate-700"><IconCircleCheck size={20} className="mt-0.5 shrink-0 text-brand-green" />{fixText(row.Description || row.Code)}</li>)}
      </ul>
      <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${declared ? 'border-brand-green-300 bg-brand-green-50' : 'border-brand-gold bg-brand-gold-50/60'}`}>
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-[#297a52]" checked={declared} disabled={!context.CanEdit} onChange={(e) => toggleDeclaration(e.target.checked)} />
        <span className="text-sm text-slate-800">I confirm that I meet the minimum requirements listed above and that the information in this application is true.<span className="required-mark" aria-hidden="true">*</span></span>
      </label>
    </> : <p className="text-slate-600">No minimum requirements are listed for this position.</p>}
    <Memberships applicationNo={applicationNo} rows={context.Memberships || []} onSaved={load} readOnly={!context.CanEdit} />
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between"><button type="button" onClick={onBack} className="btn btn-outline">Previous</button><button type="button" onClick={next} className="btn btn-primary">Save and continue</button></div>
  </div>;
}
