// Option values must match Business Central (Garissa) option fields exactly.

// "HRM-Job Applications (B)".Gender: " ",Male,Female,Other
export const GenderOptions = [
  { value: 1, label: "Male" },
  { value: 2, label: "Female" },
];

// "HRM-Job Applications (B)"."Marital Status": " ",Single,Married,Separated,Divorced,"Widow(er)",Other
export const MaritalStatusOptions = [
  { value: 1, label: "Single" },
  { value: 2, label: "Married" },
  { value: 3, label: "Separated" },
  { value: 4, label: "Divorced" },
  { value: 5, label: "Widow(er)" },
  { value: 6, label: "Other" },
];

// OnlineUsers."Marital Status" (applicant profile): Single,Married
export const ProfileMaritalStatusOptions = [
  { value: 0, label: "Single" },
  { value: 1, label: "Married" },
];

/** Maps BC option text (as returned by Format()) back to its option value; "" when unknown. */
export function optionValue(options, text) {
  if (text == null) return "";
  const value = String(text).trim();
  if (value === "") return "";
  if (options.some((option) => String(option.value) === value)) return value;
  const match = options.find((option) => option.label.toLowerCase() === value.toLowerCase());
  return match ? String(match.value) : "";
}
