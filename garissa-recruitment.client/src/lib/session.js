function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}

/** sessionStorage key: where to send the applicant after signing in (e.g. the job they chose). */
export const POST_LOGIN_REDIRECT = "postLoginRedirect";

export const getUser = () => read("user");
export const getProfile = () => read("userProfile");
export const isSignedIn = () => Boolean(getUser()?.accessToken);

export function signOut() {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
  } catch { /* storage unavailable */ }
}

const first = (value) => (Array.isArray(value) ? value[0] : value) || "";

/** "Amina Hassan" from the stored BC profile, or "" when unknown. */
export function displayName(profile = getProfile()) {
  if (!profile) return "";
  const name = `${first(profile.FirstName)} ${first(profile.LastName)}`.trim();
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(profile = getProfile()) {
  const name = displayName(profile);
  return name ? name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() : "GU";
}
