import { readJson, resultError } from './http.js';

export async function recruitmentRequest(path, options = {}) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await fetch(`/api/job/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken || ''}`, ...options.headers },
  });
  const result = await readJson(response);
  if (!response.ok || !result.success) throw new Error(resultError(result, response));
  return result.data;
}

const query = (applicationNo) => `applicationNo=${encodeURIComponent(applicationNo)}`;

/** Rules and progress for one application (status, minimum referees, document categories, memberships). */
export const applicationContext = (applicationNo) => recruitmentRequest(`application-context?${query(applicationNo)}`);

/** Items still missing before Business Central will accept the submission. */
export const submissionCheck = (applicationNo) => recruitmentRequest(`submission-check?${query(applicationNo)}`);

export const post = (path, body) => recruitmentRequest(path, { method: 'POST', body: JSON.stringify(body) });

// Business Central cannot remove these records once saved (no usable delete in codeunit 50034).
export const PERMANENT_RECORD_NOTE = 'Records in this section cannot be removed once added, so please check the details before saving.';

// The applicant's declaration that they meet the advert's minimum requirements is kept in this browser.
export const declarationKey = (applicationNo) => `app_declaration_${applicationNo}`;
export function hasDeclared(applicationNo) {
  try { return localStorage.getItem(declarationKey(applicationNo)) === 'yes'; } catch { return false; }
}
export function setDeclared(applicationNo, value) {
  try {
    if (value) localStorage.setItem(declarationKey(applicationNo), 'yes');
    else localStorage.removeItem(declarationKey(applicationNo));
  } catch { /* storage unavailable */ }
}
