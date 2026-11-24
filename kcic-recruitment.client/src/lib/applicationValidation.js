import { SalutationOptions } from "../constants/enums.js";
import { parseDate } from "./dateValidation.js";

// Fields stored on "HRM-Job Applications (B)" by codeunit 70007 UpdateApplicationPersonalDetails.
// Section 2 of the KCIC application form (all required there except Telephone and the alternative contact).
export const personalRequiredFields = [
  ["firstName", "First Name"], ["lastName", "Surname"], ["initials", "Title"],
  ["birthDate", "Date of Birth"], ["gender", "Gender"], ["nationality", "Nationality"],
  ["idNumber", "ID No / Passport No"], ["postalAddress", "Address"], ["postalCode", "Postal Code"],
  ["phoneNumber", "Mobile"], ["emailAddress", "E-mail"]
];

export function validatePersonalDetails(profile, today = new Date(), requiredFields = personalRequiredFields) {
  const fields = [...requiredFields];
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

/** The salutation as one of SalutationOptions ("" when not recognised). Accepts "Mr", "mr." etc. */
export function salutationValue(value) {
  if (isBlank(value)) return "";
  const text = String(value).trim().replace(/\.$/, "").toLowerCase();
  return SalutationOptions.find((option) => option.value.replace(/\.$/, "").toLowerCase() === text)?.value ?? "";
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
