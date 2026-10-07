export const personalRequiredFields = [
  ["firstName", "First Name"], ["lastName", "Last Name"],
  ["idNumber", "ID / Passport No"], ["emailAddress", "Email Address"],
  ["initials", "Salutation"], ["kraPin", "KRA Pin"],
  ["phoneNumber", "Phone Number"], ["altPhoneNumber", "Alt Phone Number"],
  ["birthDate", "Date of Birth"], ["gender", "Gender"], ["ethnicity", "Ethnicity"],
  ["currentSalary", "Current Salary"], ["expectedSalary", "Expected Salary"],
  ["noticePeriod", "Notice Period"], ["country", "Country"],
  ["county", "Current County of Residence"], ["subCounty", "Sub County"],
  ["wardCode", "Ward"], ["postalAddress", "Postal Address"], ["postalCode", "Postal Code"]
];

export function validatePersonalDetails(profile, today = new Date(), requiredFields = personalRequiredFields) {
  const fields = [...requiredFields];
  if (profile.disability === true || profile.disability === "true") {
    fields.push(["disabilityStatus", "Disability Type"], ["pwdNumber", "PWD Number"]);
  }
  const errors = {};
  for (const [key, label] of fields) {
    if (isBlank(profile[key])) {
      errors[key] = `${label} is required.`;
    }
  }
  for (const key of ["currentSalary", "expectedSalary"]) {
    if (fields.some(([field]) => field === key) && !errors[key] && (!Number.isFinite(Number(profile[key])) || Number(profile[key]) < 0)) {
      errors[key] = "Enter a valid amount of zero or more.";
    }
  }
  if (!errors.birthDate) {
    const error = validateBirthDate(profile.birthDate, today);
    if (error) errors.birthDate = error;
  }
  if (!errors.initials && salutationValue(profile.initials) === "") errors.initials = "Select a valid Salutation.";
  return errors;
}

export function validateResponses(answers, consent, context) {
  const errors = {};
  for (const answer of answers) {
    const key = `${answer.Kind}-${answer.LineNo}`;
    if (answer.Kind === "requirement") {
      if (answer.Required && ![1, 2].includes(Number(answer.Has))) errors[key] = "Select Yes or No.";
    } else if (answer.Required && isBlank(answer.Answer)) {
      errors[key] = "An answer is required.";
    } else if (!isBlank(answer.Answer) && answer.ResponseType === "Number" && !Number.isFinite(Number(answer.Answer))) {
      errors[key] = "Enter a valid number.";
    }
  }
  if (context.DataConsentRequired && !consent.DataConsent) errors.DataConsent = "Data collection consent is required.";
  if (context.ReferenceConsentRequired && !consent.ReferenceConsent) errors.ReferenceConsent = "Reference-check consent is required.";
  return errors;
}

export function missingRequiredDocuments(context, documents) {
  return (context.RequiredDocuments || []).filter((row) => row.Required &&
    !documents.some((doc) => (doc.requirementCode ?? doc.RequirementCode) === row.Code))
    .map((row) => `Attach the required document: ${row.Description}`);
}

export function applicationMandatoryErrors(profile, context, documents, training, today = new Date()) {
  const answers = [
    ...(context.MinimumRequirements || []).map((row) => ({ ...row, Kind: "requirement" })),
    ...(context.Questions || []).map((row) => ({ ...row, Kind: "question" }))
  ];
  const responseErrors = validateResponses(answers, context, context);
  return [
    ...Object.values(validatePersonalDetails(profile, today)),
    ...Object.entries(responseErrors).map(([key, error]) => {
      const row = answers.find((answer) => `${answer.Kind}-${answer.LineNo}` === key);
      return row ? `${row.Description}: ${error}` : error;
    }),
    ...missingRequiredDocuments(context, documents),
    ...(context.ProfessionalQualificationMandatory && !training.length ? ["Add a professional qualification or training record."] : [])
  ];
}
import { parseDate } from "./dateValidation.js";

export const isBlank = (value) => value == null || String(value).trim() === "";

export function salutationValue(value) {
  if (isBlank(value)) return "";
  const text = String(value).trim();
  if (/^[0-4]$/.test(text)) return text;
  return { Mr: "0", Mrs: "1", Miss: "2", Dr: "3", Prof: "4" }[text.replace(/\.$/, "")] ?? "";
}

export function salutationText(value) {
  const code = salutationValue(value);
  return code === "" ? "" : ["Mr.", "Mrs.", "Miss.", "Dr.", "Prof."][Number(code)];
}

export function validateBirthDate(value, today = new Date()) {
  const date = parseDate(value || "");
  if (!date) return "Enter a valid Date of Birth.";
  let age = today.getFullYear() - date.getFullYear();
  if (today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age--;
  if (age < 18) return "Applicant must be at least 18 years old.";
  if (age > 100) return "Please enter a valid Date of Birth.";
  return "";
}
