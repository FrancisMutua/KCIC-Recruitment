export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  return year > 0 && date.getFullYear() === year &&
    date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function validateDateRange(
  { startDate, endDate, isCurrent = false },
  { allowFutureEnd = false, required = true, today = new Date() } = {}
) {
  const errors = {};
  const start = parseDate(startDate || "");
  const end = parseDate(endDate || "");
  const currentDay = new Date(today);
  currentDay.setHours(0, 0, 0, 0);

  if (!startDate) {
    if (required) errors.startDate = "Start Date is required.";
  } else if (!start) {
    errors.startDate = "Enter a valid Start Date.";
  } else if (start > currentDay) {
    errors.startDate = "Start Date cannot be in the future.";
  }

  if (!isCurrent) {
    if (!endDate) {
      if (required) errors.endDate = "End Date is required.";
    } else if (!end) {
      errors.endDate = "Enter a valid End Date.";
    } else if (start && end <= start) {
      errors.endDate = "End Date must be after Start Date.";
    } else if (!allowFutureEnd && end > currentDay) {
      errors.endDate = "End Date cannot be in the future for a past position.";
    }
  }
  return errors;
}
