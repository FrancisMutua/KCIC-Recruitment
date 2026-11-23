/**
 * fetch() wrapper. When the request never gets a response (server down, DNS, TLS, CORS,
 * connection reset) browsers throw a bare TypeError such as "Failed to fetch" / "Load failed"
 * and Node throws "fetch failed" with the reason hidden in error.cause. Rethrow with the
 * URL and every available cause so the exact problem is shown.
 */
export const SESSION_EXPIRED_EVENT = "garissa:session-expired";

export async function apiFetch(input, init) {
  try {
    const response = await fetch(input, init);
    // A signed request rejected with 401 means the session token has expired.
    const headers = init?.headers;
    const authorised = headers && (headers.Authorization || headers.authorization || (typeof headers.get === "function" && headers.get("Authorization")));
    if (response.status === 401 && authorised && typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    return response;
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    const url = typeof input === "string" ? new URL(input, window.location.origin).href : input?.url;
    const causes = [];
    for (let e = error; e && causes.length < 5; e = e.cause) {
      const text = [e.code, e.message].filter(Boolean).join(" ");
      if (text && !causes.some((c) => c.includes(text))) causes.push(text);
    }
    const online = typeof navigator !== "undefined" && navigator.onLine === false ? " (browser is offline)" : "";
    throw new Error(`Could not reach ${url}: ${causes.join(" → ") || "network error"}${online}`, { cause: error });
  }
}

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
    throw new Error(`HTTP ${response.status} ${response.statusText} ${response.url}${detail ? ` - ${detail}` : " - empty response"}`.replace(/\s+/g, " ").trim());
  }
}

/** The exact message to show for a failed API result. */
export function resultError(result, response) {
  return result?.message || result?.Message || result?.title
    || (response ? `HTTP ${response.status} ${response.statusText} ${response.url}`.replace(/\s+/g, " ").trim() : "Request failed");
}
