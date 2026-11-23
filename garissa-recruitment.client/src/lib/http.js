/**
 * Reads an API response as JSON. If the server returned something else (an HTML error
 * page from IIS or a proxy, an empty 500, etc.) this throws an Error carrying the exact
 * HTTP status and response text, instead of a confusing JSON parse error.
 */
export async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    const detail = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    throw new Error(`HTTP ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`.trim());
  }
}

/** The exact message to show for a failed API result. */
export function resultError(result, response) {
  return result?.message || result?.Message || result?.title
    || (response ? `HTTP ${response.status} ${response.statusText}`.trim() : "Request failed");
}
