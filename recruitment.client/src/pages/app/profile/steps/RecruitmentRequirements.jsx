import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { applicationAction, applicationContext } from '../../../../lib/recruitmentApi';

const inputStyle = 'w-full border border-gray-300 rounded-md p-2 text-gray-800';

function Evidence({ applicationNo, kind, title, rows, onUpdated, readOnly }) {
  const [form, setForm] = useState({ Description: '', Link: '', Year: '', Quantity: '', Institution: '', MembershipNo: '' });
  const [busy, setBusy] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const save = async () => {
    if (!form.Description.trim()) return toast.info('Enter a description for this record.');
    setBusy(true);
    try {
      const context = await applicationAction(applicationNo, 'save-evidence', { ...form, Kind: kind, Year: Number(form.Year) || 0, Quantity: Number(form.Quantity) || 0 });
      onUpdated(context);
      setForm({ Description: '', Link: '', Year: '', Quantity: '', Institution: '', MembershipNo: '' });
    } catch (error) { toast.error(error.message); } finally { setBusy(false); }
  };
  const remove = async (lineNo) => {
    setBusy(true);
    try { onUpdated(await applicationAction(applicationNo, 'delete-evidence', { Kind: kind, LineNo: lineNo })); }
    catch (error) { toast.error(error.message); } finally { setBusy(false); }
  };
  return <section className="space-y-3 border-t pt-6">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <ul className="space-y-2">{rows.map((row) => <li key={row.LineNo} className="border rounded-lg p-3 flex justify-between gap-3">
      <div><strong>{row.Description}</strong><p className="text-sm text-gray-600">{[row.Institution, row.Year || '', row.MembershipNo, kind === 'supervision' ? `${row.Quantity} students` : ''].filter(Boolean).join(' · ')}</p>
        {row.Link && (/^https?:\/\//i.test(row.Link) ? <a className="text-blue-700 underline break-all" href={row.Link} target="_blank" rel="noreferrer">{row.Link}</a> : <span>{row.Link}</span>)}
      </div>
      {!readOnly && <button type="button" disabled={busy} onClick={() => remove(row.LineNo)} className="text-red-700">Remove</button>}
    </li>)}</ul>
    {!readOnly && <div className="grid sm:grid-cols-2 gap-3">
      <label>Description<input className={inputStyle} name="Description" value={form.Description} onChange={change} placeholder={kind === 'publication' ? 'Publication title' : kind === 'supervision' ? 'Programme / level supervised' : 'Professional body'} /></label>
      <label>Institution / professional body<input className={inputStyle} name="Institution" value={form.Institution} onChange={change} /></label>
      <label>Year<input className={inputStyle} type="number" name="Year" value={form.Year} onChange={change} /></label>
      {kind === 'membership' ? <label>Membership number<input className={inputStyle} name="MembershipNo" value={form.MembershipNo} onChange={change} /></label>
        : <label>{kind === 'publication' ? 'Publication link' : 'Supporting link'}<input className={inputStyle} name="Link" value={form.Link} onChange={change} placeholder="https://" /></label>}
      {kind === 'supervision' && <label>Number of students supervised<input className={inputStyle} type="number" min="0" name="Quantity" value={form.Quantity} onChange={change} /></label>}
      <div className="sm:col-span-2"><button type="button" onClick={save} disabled={busy} className="btn-primary px-4 py-2 rounded-md">{busy ? 'Saving…' : 'Add record'}</button></div>
    </div>}
  </section>;
}

export default function RecruitmentRequirements({ applicationNo, onBack, onNext }) {
  const [context, setContext] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [consent, setConsent] = useState({ HasGraduated: false, DataConsent: false, ReferenceConsent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    applicationContext(applicationNo).then((data) => {
      if (!active) return;
      setContext(data);
      setConsent({ HasGraduated: data.HasGraduated, DataConsent: data.DataConsent, ReferenceConsent: data.ReferenceConsent });
      setAnswers([...(data.MinimumRequirements || []).map((row) => ({ ...row, Kind: 'requirement' })), ...(data.Questions || []).map((row) => ({ ...row, Kind: 'question' }))]);
    }).catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, [applicationNo]);
  const update = (index, values) => setAnswers((rows) => rows.map((row, i) => i === index ? { ...row, ...values } : row));
  const next = async () => {
    setBusy(true);
    try {
      await applicationAction(applicationNo, 'save-responses', { ...consent, Responses: answers.map(({ Kind, LineNo, Has, Answer }) => ({ Kind, LineNo, Has, Answer })) });
      onNext();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  if (error) return <p role="alert" className="text-red-700">{error}</p>;
  if (!context) return <p>Loading application requirements…</p>;
  return <div className="space-y-6">
    <h3 className="text-xl font-semibold">Job requirements and supporting information</h3>
    <label className="flex items-center gap-2"><input type="checkbox" checked={consent.HasGraduated} onChange={(e) => setConsent({ ...consent, HasGraduated: e.target.checked })} />I have graduated at the time of this application.</label>
    {answers.map((answer, index) => <div key={`${answer.Kind}-${answer.LineNo}`} className="space-y-2">
      <label className="block font-medium" htmlFor={`response-${index}`}>{answer.Description}{answer.Required ? ' *' : ''}</label>
      {answer.Kind === 'requirement' ? <select id={`response-${index}`} className={inputStyle} value={answer.Has ?? 0} onChange={(e) => update(index, { Has: Number(e.target.value) })}><option value={0}>Select an answer</option><option value={2}>Yes</option><option value={1}>No</option></select>
        : answer.ResponseType === 'Yes/No' ? <select id={`response-${index}`} className={inputStyle} value={answer.Answer || ''} onChange={(e) => update(index, { Answer: e.target.value })}><option value="">Select an answer</option><option>Yes</option><option>No</option></select>
          : <input id={`response-${index}`} className={inputStyle} type={answer.ResponseType === 'Number' ? 'number' : 'text'} value={answer.Answer || ''} onChange={(e) => update(index, { Answer: e.target.value })} />}
    </div>)}
    <Evidence applicationNo={applicationNo} title="Professional memberships" kind="membership" rows={context.Memberships || []} onUpdated={setContext} />
    {context.AcademicJob && <><Evidence applicationNo={applicationNo} title="Publications" kind="publication" rows={context.Publications || []} onUpdated={setContext} /><Evidence applicationNo={applicationNo} title="Students supervised" kind="supervision" rows={context.Supervisions || []} onUpdated={setContext} /></>}
    <section className="space-y-4 border-t pt-6"><h3 className="text-lg font-semibold">Consent</h3>
      <label className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={consent.DataConsent} onChange={(e) => setConsent({ ...consent, DataConsent: e.target.checked })} /><span>{context.DataConsentText}</span></label>
      <label className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={consent.ReferenceConsent} onChange={(e) => setConsent({ ...consent, ReferenceConsent: e.target.checked })} /><span>{context.ReferenceConsentText}</span></label>
    </section>
    <div className="flex justify-between"><button type="button" onClick={onBack} className="px-4 py-2 rounded bg-gray-200">Previous</button><button type="button" onClick={next} disabled={busy} className="btn-primary px-5 py-2 rounded">{busy ? 'Saving…' : 'Save and continue'}</button></div>
  </div>;
}
