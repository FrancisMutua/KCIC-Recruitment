import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { applicationContext, recruitmentRequest } from '../../../../lib/recruitmentApi';
import { missingRequiredDocuments } from '../../../../lib/applicationValidation';
import { IconCircleCheck, IconCircleDashed, IconFileTypePdf, IconLoader2, IconTrash, IconUpload } from '@tabler/icons-react';
import { Alert } from '../../../../components/ui/kit';

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
  const uploadedCodes = new Set(documents.map((doc) => doc.requirementCode));
  return (
    <div className="space-y-6">
      {error && <Alert tone="error" title="Your documents couldn't be loaded">{error}</Alert>}

      {!!categories.length && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {categories.map((row) => {
            const done = uploadedCodes.has(row.Code);
            return (
              <li key={row.Code} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${done ? "border-brand-green-200 bg-brand-green-50" : "border-slate-200 bg-white"}`}>
                {done ? <IconCircleCheck size={20} className="shrink-0 text-brand-green-600" /> : <IconCircleDashed size={20} className="shrink-0 text-slate-300" />}
                <span className="min-w-0 flex-1 font-medium text-slate-800">{row.Description}</span>
                <span className={`badge ${done ? "badge-green" : row.Required ? "badge-gold" : "badge-gray"}`}>{done ? "Uploaded" : row.Required ? "Required" : "Optional"}</span>
              </li>
            );
          })}
        </ul>
      )}

      {context?.CanEdit && (
        <form onSubmit={upload} className="space-y-4 rounded-xl border border-dashed border-brand-green-300 bg-brand-green-50/40 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="doc-type" className="field-label">Document type<span className="required-mark" aria-hidden="true">*</span></label>
              <select id="doc-type" value={category} onChange={(e) => setCategory(e.target.value)} className="field-input">
                <option value="">Select document type</option>
                {categories.map((row) => <option key={row.Code} value={row.Code}>{row.Description}{uploadedCodes.has(row.Code) ? " (uploaded)" : ""}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="doc-file" className="field-label">PDF file<span className="required-mark" aria-hidden="true">*</span></label>
              <input id="doc-file" type="file" accept=".pdf,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} aria-describedby="doc-file-hint"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-green-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-green-700" />
              <p id="doc-file-hint" className="field-hint">PDF only, up to 5 MB.{file ? ` Selected: ${file.name}` : ""}</p>
            </div>
          </div>
          <button type="submit" disabled={busy || !file} className="btn btn-primary">
            {busy ? <IconLoader2 size={18} className="animate-spin" /> : <IconUpload size={18} />}
            {busy ? "Uploading…" : "Upload document"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <header className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Uploaded documents</h3>
          <span className="badge badge-gray">{documents.length}</span>
        </header>
        {documents.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">No documents attached yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <IconFileTypePdf size={22} className="shrink-0 text-brand-brown-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.fileName}.{doc.fileExtension || "pdf"}</p>
                  <p className="text-xs text-slate-500">{doc.documentType}{doc.documentDate ? ` · ${new Date(doc.documentDate).toLocaleDateString("en-GB")}` : ""}</p>
                </div>
                {context?.CanEdit && (
                  <button type="button" disabled={busy} className="btn btn-danger btn-sm" onClick={() => remove(doc.id)} aria-label={`Remove ${doc.fileName}`}>
                    <IconTrash size={16} /> <span className="hidden sm:inline">Remove</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!!missingDocuments.length && <Alert tone="warn" title="Still needed before you can continue"><ul className="list-disc pl-5">{missingDocuments.map((message) => <li key={message}>{message}</li>)}</ul></Alert>}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="btn btn-outline">Previous</button>
        <button type="button" onClick={onNext} disabled={busy || !context || missingDocuments.length > 0} className="btn btn-primary">Review application</button>
      </div>
    </div>
  );
}
