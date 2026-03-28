/**
 * Resolve the API base used by the app to an absolute URL for MSW handlers.
 *
 * Empty values mean same-origin in development, so requests resolve against the
 * current browser origin and can be intercepted without any CORS preflight.
 */
export function resolveMockApiBase(apiBase: string | null | undefined) {
  const normalized = (apiBase ?? "").trim().replace(/\/$/, "");

  if (normalized) {
    return new URL(normalized, window.location.origin)
      .toString()
      .replace(/\/$/, "");
  }

  return window.location.origin;
}
