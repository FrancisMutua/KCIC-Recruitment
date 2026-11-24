import { isBlank } from "./applicationValidation.js";
import { validateDateRange } from "./dateValidation.js";

/**
 * Field configuration shared by the application steps:
 * { name, label, type: text|email|tel|number|date|textarea|select|yesno|checkbox|lookup,
 *   required, maxLength, options, lookupType, placeholder, hint, full, show(values) }
 */
export const inputClass = (error, extra = "bg-white") =>
  `mt-1 block w-full border ${error ? "border-red-500 focus:ring-red-500" : "border-slate-300"} rounded-lg shadow-sm px-3 py-2.5 ${extra}`;

export const isShown = (field, values) => !field.show || field.show(values);

/** Required-field and date-range errors for the visible fields. */
export function validateFields(fields, values, { dateRange } = {}) {
  const errors = {};
  for (const field of fields) {
    if (!isShown(field, values) || !field.required) continue;
    if (field.type === "checkbox" ? false : isBlank(values[field.name])) errors[field.name] = `${field.label} is required.`;
  }
  if (dateRange) {
    const rangeErrors = validateDateRange(values, { required: false, ...dateRange });
    for (const [key, message] of Object.entries(rangeErrors)) if (!errors[key]) errors[key] = message;
  }
  return errors;
}
