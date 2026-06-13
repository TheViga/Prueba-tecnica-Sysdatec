import Icon from './Icon.jsx';
import { PriorityChip, CategoryChip, AiPill, Avatar } from './Chips.jsx';
import { timeAgo } from '../lib/format.js';

export default function TicketCard({ ticket, onOpen }) {
  const hasSummary = Boolean(ticket.summary);
  return (
    <button
      onClick={() => onOpen(ticket.id)}
      className="text-left bg-surface border border-line rounded-field px-3.5 py-[13px] flex flex-col gap-2.5 shadow-sm transition hover:border-line-strong hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-ink-faint">#{ticket.id.slice(0, 6)}</span>
        <AiPill status={ticket.aiStatus} />
      </div>

      <div className="font-semibold text-[14.5px] leading-snug">{ticket.customerName}</div>

      <p
        className={`text-[13px] leading-normal line-clamp-3 ${
          hasSummary ? 'text-ink-soft' : 'text-ink-faint italic'
        }`}
      >
        {hasSummary ? ticket.summary : ticket.requestText}
      </p>

      {(ticket.priority || ticket.category) && (
        <div className="flex flex-wrap gap-1.5">
          <PriorityChip value={ticket.priority} />
          <CategoryChip value={ticket.category} />
        </div>
      )}

      <div className="flex items-center gap-3 pt-1 border-t border-line text-ink-faint text-xs">
        <Avatar name={ticket.owner} />
        {ticket._commentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Icon name="message" size={13} />
            {ticket._commentCount}
          </span>
        )}
        <span className="ml-auto font-mono text-[11px]">{timeAgo(ticket.createdAt)}</span>
      </div>
    </button>
  );
}
