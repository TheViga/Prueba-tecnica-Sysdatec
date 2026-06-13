// Shared Tailwind class strings for elements that repeat across the app. Kept as
// full literal strings so Tailwind's content scanner picks them up.
export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-field px-[15px] py-[9px] text-sm font-semibold transition active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0';

export const btnPrimary = `${btnBase} bg-accent text-white shadow-glow hover:bg-accent-press`;
export const btnGhost = `${btnBase} bg-surface border border-line-strong text-ink hover:border-ink-faint`;
export const btnSubtle = `${btnBase} text-ink-soft hover:bg-surface-soft hover:text-ink`;

export const inputBase =
  'w-full rounded-field border border-line-strong bg-surface px-[11px] py-[9px] text-sm transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/30';

export const fieldLabel =
  'block font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-faint mb-1.5';

export const eyebrow =
  'font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint';

export const blockHeading =
  'font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint mb-2';

export const banner =
  'flex items-center gap-2.5 rounded-field bg-high-soft px-3 py-2.5 text-[13px] font-medium text-high';
