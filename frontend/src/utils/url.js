// Defensive safety net for links coming from the API (meeting links, assignment
// file URLs). Older records saved before the backend started normalizing URLs
// may be missing a scheme (e.g. "meet.google.com/abc"). Without a scheme, an
// <a href="meet.google.com/abc"> is resolved as a *relative* path by the
// browser and reopens the current app instead of navigating away. This adds
// "https://" whenever one isn't already present.
export function safeHref(url) {
  if (!url) return '#';
  const trimmed = String(url).trim();
  if (!trimmed) return '#';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
