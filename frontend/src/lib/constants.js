// Mirrors the enums the backend validates against. Keeping them here lets the UI
// render dropdowns and columns without guessing.
export const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
export const CATEGORIES = ['Finance', 'Legal', 'Procurement', 'Operations'];
export const PRIORITIES = ['High', 'Medium', 'Low'];

// Tailwind background classes for each status, used on column rails and the
// queue dots in the sidebar.
export const STATUS_DOT = {
  Open: 'bg-accent',
  'In Progress': 'bg-medium',
  Resolved: 'bg-low',
  Closed: 'bg-ink-faint',
};

export const AI_STATUS_LABEL = {
  pending: 'Awaiting triage',
  processing: 'Classifying…',
  done: 'Classified',
  failed: 'Triage failed',
};
