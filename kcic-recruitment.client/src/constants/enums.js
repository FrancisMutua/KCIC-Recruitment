// Option values are the text codeunit 70007 accepts and returns (see Cod70007.HRMPortalRecruitment.al).

// MapGenderFromPortal / GenderToText: "HRM-Job Applications (B)".Gender is Male,Female.
export const GenderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

// MapMaritalStatusFromPortal accepts these texts; MaritalStatusToText returns them (Widow(er) reads back as "Widow").
export const MaritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widow", label: "Widowed" },
  { value: "Complicated", label: "Other" },
];

// Titles in the order of the KCIC form (Prof/Dr/Mr./Mrs./Miss/Ms./Rev); TitleFromInt uses the same set.
export const SalutationOptions = ["Prof", "Dr", "Mr.", "Mrs.", "Miss", "Ms.", "Rev"].map((value) => ({ value, label: value }));

// AddAcademicQualification maps exactly these to "Qualification Attained".
export const AcademicLevelOptions = ["Degree", "Diploma", "Certificate", "Other"].map((value) => ({ value, label: value }));

/** Maps option text (as returned by BC) to its option value; "" when unknown. */
export function optionValue(options, text) {
  if (text == null) return "";
  const value = String(text).trim();
  if (value === "") return "";
  const match = options.find((option) => String(option.value).toLowerCase() === value.toLowerCase())
    || options.find((option) => option.label.toLowerCase() === value.toLowerCase());
  return match ? String(match.value) : "";
}
