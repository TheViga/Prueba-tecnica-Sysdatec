import TicketCard from './TicketCard.jsx';
import { STATUSES, STATUS_DOT } from '../lib/constants.js';

export default function Board({ tickets, onOpen }) {
  return (
    <div className="grid grid-flow-row md:grid-flow-col md:auto-cols-[minmax(290px,1fr)] gap-[18px] p-4 md:px-7 md:pt-[22px] md:pb-10 min-h-full items-start">
      {STATUSES.map((status) => {
        const items = tickets.filter((t) => (t.status || 'Open') === status);
        return (
          <section
            key={status}
            className="bg-surface-soft border border-line rounded-card flex flex-col max-h-full"
          >
            <header className="flex items-center gap-2.5 px-[15px] pt-3.5 pb-3 border-b border-line">
              <span className={`w-[9px] h-[9px] rounded-[3px] flex-none ${STATUS_DOT[status]}`} />
              <span className="font-display font-semibold text-sm">{status}</span>
              <span className="ml-auto font-mono text-xs text-ink-faint bg-surface border border-line rounded-full px-2.5 py-px">
                {items.length}
              </span>
            </header>
            <div className="p-3 flex flex-col gap-3 overflow-auto">
              {items.length === 0 ? (
                <div className="text-center text-[12.5px] text-ink-faint py-[22px] px-2 border border-dashed border-line-strong rounded-field">
                  No tickets here
                </div>
              ) : (
                items.map((t) => <TicketCard key={t.id} ticket={t} onOpen={onOpen} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
