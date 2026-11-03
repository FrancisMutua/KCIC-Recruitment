export function getRefereeSubmissionStatus(minimum, count) {
  if (!Number.isInteger(minimum) || minimum < 0) {
    return {
      blocked: true,
      message: "The referee requirement could not be loaded. Please reload the application."
    };
  }
  const remaining = Math.max(0, minimum - count);
  return {
    blocked: remaining > 0,
    message: remaining > 0
      ? `Add ${remaining} more referee${remaining === 1 ? "" : "s"} before submitting. You have ${count} of the minimum ${minimum} required.`
      : ""
  };
}
