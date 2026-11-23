// Business Central formats dates with the service tier's locale (default MM/DD/YY).
// The order is learned from any unambiguous date seen (a part > 12), e.g. "25/11/26"
// proves the service is day-first, so "05/01/27" is then read as 5 Jan, not 1 May.
let learnedDayFirst = null;

/** Learn the day/month order from a batch of BC date strings. Returns the learned order. */
export function learnDateOrder(values) {
  for (const value of values) {
    const parts = /^(\d{1,2})[/.-](\d{1,2})[/.-]\d{2,4}$/.exec(String(value ?? "").trim());
    if (!parts) continue;
    if (+parts[1] > 12) { learnedDayFirst = true; break; }
    if (+parts[2] > 12) { learnedDayFirst = false; break; }
  }
  return learnedDayFirst;
}

export function resetDateOrder() { learnedDayFirst = null; }

export function parseBcDate(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (iso) return build(+iso[1], +iso[2], +iso[3]);
  const parts = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(text);
  if (!parts) return null;
  let [a, b, year] = [+parts[1], +parts[2], +parts[3]];
  // Two-digit years: anything more than 5 years ahead is last century (birth dates).
  if (year < 100) year += 2000 + year > new Date().getFullYear() + 5 ? 1900 : 2000;
  const dayFirst = a > 12 || (b <= 12 && learnedDayFirst === true);
  const [month, day] = dayFirst ? [b, a] : [a, b];
  return build(year, month, day);
}

function build(year, month, day) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/** "YYYY-MM-DD" for <input type="date">, or "" when unparseable. */
export function toIsoDate(value) {
  const date = value instanceof Date ? value : parseBcDate(value);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whole days from today until the date (0 = today, negative = past); null if unparseable. */
export function daysUntil(value, today = new Date()) {
  const date = value instanceof Date ? value : parseBcDate(value);
  if (!date) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((date - start) / 86400000);
}

/** "30 Nov 2026"; falls back to the original text when it can't be parsed. */
export function formatDate(value) {
  const date = value instanceof Date ? value : parseBcDate(value);
  if (!date) return String(value ?? "");
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Short applicant-facing deadline text. */
export function deadlineLabel(value, today = new Date()) {
  const days = daysUntil(value, today);
  if (days == null) return "";
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `${days} days left`;
}
