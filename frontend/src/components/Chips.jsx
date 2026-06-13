import Icon from './Icon.jsx';
import { AI_STATUS_LABEL } from '../lib/constants.js';
import { initials } from '../lib/format.js';

const chipBase =
  'inline-flex items-center gap-1.5 rounded-full px-[9px] py-[3px] text-xs font-semibold leading-snug border border-transparent';
const dotBase = 'w-1.5 h-1.5 rounded-full';

const PRIORITY = {
  High: { chip: 'bg-high-soft text-high', dot: 'bg-high' },
  Medium: { chip: 'bg-medium-soft text-medium', dot: 'bg-medium' },
  Low: { chip: 'bg-low-soft text-low', dot: 'bg-low' },
};

const CATEGORY_DOT = {
  Finance: 'bg-cat-finance',
  Legal: 'bg-cat-legal',
  Procurement: 'bg-cat-procurement',
  Operations: 'bg-cat-operations',
};

const AI = {
  pending: { cls: 'bg-[#f0efeb] text-ink-faint', icon: 'sparkles' },
  processing: { cls: 'bg-accent-soft text-accent', icon: 'refresh' },
  done: { cls: 'bg-low-soft text-low', icon: 'check' },
  failed: { cls: 'bg-high-soft text-high', icon: 'alert' },
};

export function PriorityChip({ value }) {
  const v = PRIORITY[value];
  if (!v) return null;
  return (
    <span className={`${chipBase} ${v.chip}`}>
      <span className={`${dotBase} ${v.dot}`} />
      {value}
    </span>
  );
}

export function CategoryChip({ value }) {
  const dot = CATEGORY_DOT[value];
  if (!dot) return null;
  return (
    <span className={`${chipBase} bg-surface-soft border-line text-ink-soft`}>
      <span className={`${dotBase} ${dot}`} />
      {value}
    </span>
  );
}

export function AiPill({ status }) {
  const s = status || 'pending';
  const meta = AI[s] || AI.pending;
  const label = AI_STATUS_LABEL[s] || s;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full pl-[7px] pr-[9px] py-[3px] font-mono text-[11.5px] font-semibold ${meta.cls}`}
    >
      <Icon name={meta.icon} size={13} className={s === 'processing' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
}

export function Avatar({ name }) {
  const base = 'w-6 h-6 rounded-full grid place-items-center text-[10.5px] font-bold font-mono flex-none';
  if (!name) {
    return (
      <span className={`${base} bg-line-strong text-ink-faint`} title="Unassigned">
        <Icon name="user" size={13} />
      </span>
    );
  }
  return (
    <span className={`${base} text-white bg-gradient-to-br from-[#6a5bff] to-[#4536c9]`} title={name}>
      {initials(name)}
    </span>
  );
}
