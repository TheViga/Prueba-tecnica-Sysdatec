// Relative time for recent items, falling back to an absolute date for old ones.
export function timeAgo(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  if (seconds < 45) return 'just now';
  for (const [unit, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      return rtf.format(-value, unit);
    }
  }
  return 'just now';
}

export function fullDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// "Jane Doe" -> "JD" for avatar badges.
export function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}
