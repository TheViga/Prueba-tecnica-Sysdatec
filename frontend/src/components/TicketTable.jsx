import { PriorityChip, CategoryChip, AiPill } from './Chips.jsx';
import { timeAgo } from '../lib/format.js';

const th =
  'text-left font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-faint font-semibold px-4 py-[13px] bg-surface-soft border-b border-line';
const td = 'px-4 py-[13px] border-b border-line text-[13.5px] align-middle';

export default function TicketTable({ tickets, onOpen }) {
  return (
    <div className="p-4 md:px-7 md:pt-[22px] md:pb-10 overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 bg-surface border border-line rounded-card overflow-hidden">
        <thead>
          <tr>
            <th className={th}>Customer</th>
            <th className={th}>Priority</th>
            <th className={th}>Category</th>
            <th className={th}>Status</th>
            <th className={th}>Triage</th>
            <th className={th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="cursor-pointer transition-colors hover:bg-surface-soft [&:last-child>td]:border-b-0"
            >
              <td className={td}>
                <div className="font-semibold">{t.customerName}</div>
                <div className="text-ink-faint text-xs">
                  {t.summary || t.requestText.slice(0, 60)}
                </div>
              </td>
              <td className={td}>
                <PriorityChip value={t.priority} />
              </td>
              <td className={td}>
                <CategoryChip value={t.category} />
              </td>
              <td className={td}>{t.status || 'Open'}</td>
              <td className={td}>
                <AiPill status={t.aiStatus} />
              </td>
              <td className={`${td} font-mono text-ink-faint text-xs`}>{timeAgo(t.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
