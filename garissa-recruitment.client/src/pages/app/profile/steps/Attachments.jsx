import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { applicationAction, applicationContext, recruitmentRequest, saveDownload } from '../../../../lib/recruitmentApi';
import { missingRequiredDocuments } from '../../../../lib/applicationValidation';

const categories = [[0, 'CV'], [1, 'Cover letter'], [2, 'Academic certificate'], [3, 'Professional certificate'], [4, 'Other testimonials'], [5, 'Publication / research paper'], [6, 'Grants'], [8, 'Other attachment'], [9, 'ID / passport'], [10, 'Leaving certificate'], [11, 'Supervision evidence']];
export default function Attachments({ applicationNo, onBack, onNext, onSubmit, signedOffer = false, onUpdated }) {
  const [documents, setDocuments] = useState([]);
  const [context, setContext] = useState(null);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(signedOffer ? 7 : 0);
  const [requirement, setRequirement] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const [files, details] = await Promise.all([recruitmentRequest(`attached-documents?applicationNo=${encodeURIComponent(applicationNo)}`), applicationContext(applicationNo)]);
    setDocuments(files || []); setContext(details);
  }, [applicationNo]);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);
  const upload = async (event) => {
    event.preventDefault();
    if (!file) return toast.info('Select a PDF document first.');
    if (!file.name.toLowerCase().endsWith('.pdf')) return toast.error('Only PDF documents are accepted.');
    if (file.size > 5 * 1024 * 1024) return toast.error('Please select a PDF smaller than 5 MB.');
    setBusy(true);
    try {
      const attachment = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await recruitmentRequest('upload-document', { method: 'POST', body: JSON.stringify({ applicationNo, fileName: file.name, attachment, docType: signedOffer ? 7 : Number(category), requirementCode: requirement }) });
      setFile(null); event.target.reset();
      await load(); onUpdated?.();
      toast.success('Document saved to your application.');
    } catch (e) { toast.error(e.message || 'The document could not be uploaded.'); } finally { setBusy(false); }
  };
  const remove = async (id) => {
    setBusy(true);
    try { await recruitmentRequest(`delete-document?id=${encodeURIComponent(id)}&applicationNo=${encodeURIComponent(applicationNo)}`, { method: 'DELETE' }); await load(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const download = async (id) => {
    try { saveDownload(await applicationAction(applicationNo, 'download-document', { Id: id })); }
    catch (e) { toast.error(e.message); }
  };
  const missingDocuments = context ? missingRequiredDocuments(context, documents) : [];
  return <div className="space-y-6">
    <h3 className="text-lg font-semibold">{signedOffer ? 'Signed offer letter' : 'Application documents'}</h3>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!!context?.RequiredDocuments?.length && !signedOffer && <div className="bg-blue-50 rounded p-4"><p className="font-medium">Documents requested by this advert</p><ul className="list-disc pl-5">{context.RequiredDocuments.map((row) => <li key={row.LineNo}>{row.Description}{row.Required ? ' (required)' : ' (optional)'}</li>)}</ul></div>}
    {!signedOffer && !!missingDocuments.length && <ul role="alert" className="list-disc pl-5 text-red-700">{missingDocuments.map((message) => <li key={message}>{message}</li>)}</ul>}
    {(context?.CanEdit || (signedOffer && context?.CanRespondToOffer)) && <form onSubmit={upload} className="border rounded-lg p-5 space-y-4">
      {!signedOffer && <><label className="block">Document category<select value={category} onChange={(e) => setCategory(Number(e.target.value))} className="border rounded p-2 w-full">{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {!!context.RequiredDocuments?.length && <label className="block">Advert requirement<select value={requirement} onChange={(e) => setRequirement(e.target.value)} className="border rounded p-2 w-full"><option value="">General supporting document</option>{context.RequiredDocuments.map((row) => <option key={row.LineNo} value={row.Code}>{row.Description}</option>)}</select></label>}</>}
      <label className="block">PDF document<input type="file" accept=".pdf,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block mt-2" /></label>
      <p className="text-sm text-gray-500">PDF only, up to 5 MB.</p>
      <button type="submit" disabled={busy || !file} className="btn-primary px-4 py-2 rounded disabled:opacity-50">{busy ? 'Uploading…' : 'Upload document'}</button>
    </form>}
    <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-3">Document</th><th className="p-3">Category</th><th className="p-3">Advert requirement</th><th className="p-3">Actions</th></tr></thead><tbody>{documents.map((doc) => <tr key={doc.id} className="border-b"><td className="p-3">{doc.fileName}.pdf</td><td className="p-3">{doc.documentType}</td><td className="p-3">{context?.RequiredDocuments?.find((row) => row.Code === doc.requirementCode)?.Description || doc.requirementCode || 'General'}</td><td className="p-3 flex gap-3"><button type="button" className="text-blue-700" onClick={() => download(doc.id)}>Download</button>{context?.CanEdit && <button type="button" disabled={busy} className="text-red-700" onClick={() => remove(doc.id)}>Remove</button>}</td></tr>)}</tbody></table>{!documents.length && <p className="py-4 text-gray-500">No documents attached yet.</p>}</div>
    {!signedOffer && <div className="flex justify-between"><button type="button" onClick={onBack} className="bg-gray-200 px-4 py-2 rounded">Previous</button><button type="button" onClick={onNext || onSubmit} disabled={busy || !context || missingDocuments.length > 0} className="btn-primary px-4 py-2 rounded disabled:opacity-50">Review application</button></div>}
  </div>;
}
