// Ensures user-submitted links (meeting links, assignment file URLs) always
// have an explicit scheme. Without this, an <a href="meet.google.com/abc">
// is treated by the browser as a *relative* path and resolves against the
// current origin (e.g. localhost:3000/meet.google.com/abc) instead of
// navigating away — which looks like "the button does nothing".
export function normalizeUrl(raw) {
  if (!raw) return raw;
  const trimmed = String(raw).trim();
  if (!trimmed) return trimmed;
  // Already has a scheme (http:, https:, mailto:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
