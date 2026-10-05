export async function recruitmentRequest(path, options = {}) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await fetch(`/api/job/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken || ''}`, ...options.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) throw new Error(result.message || result.Message || 'The request could not be completed. Please try again.');
  return result.data;
}

export const applicationContext = (applicationNo) => recruitmentRequest(`application-context?applicationNo=${encodeURIComponent(applicationNo)}`);
export const applicationAction = (applicationNo, action, data = {}) => recruitmentRequest('application-action', {
  method: 'POST', body: JSON.stringify({ applicationNo, action, data }),
});

export function saveDownload(file) {
  const bytes = Uint8Array.from(atob(file.Content), (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.FileName || 'document.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
