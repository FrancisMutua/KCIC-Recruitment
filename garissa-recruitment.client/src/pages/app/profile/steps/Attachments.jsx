import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { applicationContext, recruitmentRequest } from '../../../../lib/recruitmentApi';
import { missingRequiredDocuments } from '../../../../lib/applicationValidation';

const query = (applicationNo) => `applicationNo=${encodeURIComponent(applicationNo)}`;

export default function Attachments({ applicationNo, onBack, onNext }) {
  const [documents, setDocuments] = useState([]);
  const [context, setContext] = useState(null);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const [files, details] = await Promise.all([recruitmentRequest(`attached-documents?${query(applicationNo)}`), applicationContext(applicationNo)]);
    setDocuments(files || []); setContext(details);
  }, [applicationNo]);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  const categories = context?.DocumentCategories || [];
  const upload = async (event) => {
    event.preventDefault();
    const form = event.target;
    if (!category) return toast.info('Select the type of document you are uploading.');
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
      await recruitmentRequest('upload-document', { method: 'POST', body: JSON.stringify({ applicationNo, fileName: file.name, attachment, requirementCode: category }) });
      setFile(null); setCategory(''); form.reset();
      await load();
      toast.success('Document saved to your application.');
    } catch (e) { toast.error(e.message || 'The document could not be uploaded.'); } finally { setBusy(false); }
  };
  const remove = async (id) => {
    if (!window.confirm('Remove this document from your application?')) return;
    setBusy(true);
    try { await recruitmentRequest(`delete-document?id=${encodeURIComponent(id)}&${query(applicationNo)}`, { method: 'DELETE' }); await load(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const missingDocuments = context ? missingRequiredDocuments(context, documents) : [];
  return <div className="space-y-6">
    <h3 className="text-lg font-semibold">Application documents</h3>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!!categories.length && <div className="bg-blue-50 rounded p-4"><p className="font-medium">Documents for this application</p><ul className="list-disc pl-5">{categories.map((row) => <li key={row.Code}>{row.Description}{row.Required ? ' (required)' : ' (optional)'}</li>)}</ul></div>}
    {!!missingDocuments.length && <ul role="alert" className="list-disc pl-5 text-red-700">{missingDocuments.map((message) => <li key={message}>{message}</li>)}</ul>}
    {context?.CanEdit && <form onSubmit={upload} className="border rounded-lg p-5 space-y-4">
      <label className="block">Document type<select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded p-2 w-full"><option value="">Select document type</option>{categories.map((row) => <option key={row.Code} value={row.Code}>{row.Description}</option>)}</select></label>
      <label className="block">PDF document<input type="file" accept=".pdf,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block mt-2" /></label>
      <p className="text-sm text-gray-500">PDF only, up to 5 MB.</p>
      <button type="submit" disabled={busy || !file} className="btn-primary px-4 py-2 rounded disabled:opacity-50">{busy ? 'Uploading…' : 'Upload document'}</button>
    </form>}
    <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-3">Document</th><th className="p-3">Type</th><th className="p-3">Uploaded</th>{context?.CanEdit && <th className="p-3">Actions</th>}</tr></thead><tbody>{documents.map((doc) => <tr key={doc.id} className="border-b"><td className="p-3">{doc.fileName}.{doc.fileExtension || 'pdf'}</td><td className="p-3">{doc.documentType}</td><td className="p-3">{doc.documentDate ? new Date(doc.documentDate).toLocaleDateString() : ''}</td>{context?.CanEdit && <td className="p-3"><button type="button" disabled={busy} className="text-red-700" onClick={() => remove(doc.id)}>Remove</button></td>}</tr>)}</tbody></table>{!documents.length && <p className="py-4 text-gray-500">No documents attached yet.</p>}</div>
    <div className="flex justify-between"><button type="button" onClick={onBack} className="bg-gray-200 px-4 py-2 rounded">Previous</button><button type="button" onClick={onNext} disabled={busy || !context || missingDocuments.length > 0} className="btn-primary px-4 py-2 rounded disabled:opacity-50">Review application</button></div>
  </div>;
}
