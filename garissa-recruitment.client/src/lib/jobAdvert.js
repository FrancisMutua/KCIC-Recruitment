// Business Central text can arrive with punctuation mis-decoded (e.g. "1ËÇô3" for "1–3").
const MOJIBAKE = [
  [/ËÇô/g, "–"], [/ËÇö/g, "—"],
  [/â€“/g, "–"], [/â€”/g, "—"], [/â€™/g, "’"], [/â€˜/g, "‘"], [/â€œ/g, "“"], [/â€[\u009d]/g, "”"], [/Â\u00a0/g, " "]
];

export function fixText(value) {
  return MOJIBAKE.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), String(value ?? ""));
}

export function advertLines(rows = []) {
  return rows.flatMap((row) => fixText(row.description ?? row.Description ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim()
      .replace(/^(?:[•●]\s*|[-*]\s+|\d+\s*:\s*|\d+[.)]\s+|:\s*)/, "").trim())
    .filter(Boolean));
}

export function advertRows(rows) {
  if (typeof rows === "string") return JSON.parse(rows || "[]");
  return Array.isArray(rows) ? rows : [];
}

export function advertFields(job) {
  return [
    ["Job reference", job.documentNo], ["Job ID", job.jobId],
    ["Job grade", job.jobGrade], ["Department", job.departmentName || job.departmentCode],
    ["Reporting to", job.reportingToName || job.reportingTo],
    ["Specialization", job.jobSpecialization], ["Requisition type", job.requisitionType],
    ["Duty station", job.dutyStation], ["Terms of employment", job.employmentTerms],
    ["Terms of service", job.termsOfService], ["Vacancies", job.vacancy],
    ["Opening date", job.startDate], ["Closing date", job.endDate],
    ["Basic salary", job.basicSalary], ["Allowances", job.allowances],
    ["Academic position", job.academicJob == null ? "" : job.academicJob ? "Yes" : "No"],
    ["Professional training required", job.professionalTrainingRequired == null ? "" : job.professionalTrainingRequired ? "Yes" : "No"]
  ].map(([label, value]) => [label, value == null || String(value).trim() === "" ? "" : String(value)]);
}
