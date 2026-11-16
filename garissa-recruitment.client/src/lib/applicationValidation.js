import { parseDate } from "./dateValidation.js";

// Fields stored on "HRM-Job Applications (B)" by codeunit 50034 UpdateApplicationPersonalDetails.
export const personalRequiredFields = [
  ["firstName", "First Name"], ["lastName", "Last Name"],
  ["idNumber", "ID / Passport No"], ["emailAddress", "Email Address"],
  ["initials", "Salutation"], ["kraPin", "KRA Pin"],
  ["phoneNumber", "Phone Number"],
  ["birthDate", "Date of Birth"], ["gender", "Gender"], ["maritalStatus", "Marital Status"],
  ["citizenship", "Citizenship"], ["country", "Country"],
  ["county", "Current County of Residence"], ["postalAddress", "Postal Address"], ["postalCode", "Postal Code"]
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
  if (!errors.birthDate) {
    const error = validateBirthDate(profile.birthDate, today);
    if (error) errors.birthDate = error;
  }
  if (fields.some(([key]) => key === "initials") && !errors.initials && salutationValue(profile.initials) === "") {
    errors.initials = "Select a valid Salutation.";
  }
  return errors;
}

/** Required document categories (from the application context) with no uploaded file. */
export function missingRequiredDocuments(context, documents) {
  return (context.DocumentCategories || []).filter((row) => row.Required &&
    !documents.some((doc) => (doc.requirementCode ?? doc.RequirementCode) === row.Code))
    .map((row) => `Attach your ${row.Description}.`);
}

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
