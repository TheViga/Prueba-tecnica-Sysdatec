import Icon from './Icon.jsx';
import { STATUSES, STATUS_DOT } from '../lib/constants.js';

const railBtn =
  'w-full flex items-center gap-[11px] rounded-[10px] px-2.5 py-[9px] text-sm font-medium transition-colors';

export default function Sidebar({ tickets, statusFilter, onStatusFilter, health }) {
  const countFor = (status) =>
    status === 'all'
      ? tickets.length
      : tickets.filter((t) => (t.status || 'Open') === status).length;

  return (
    <aside
      className="hidden md:flex flex-col gap-7 bg-rail text-onrail px-4 py-[22px]"
      style={{
        backgroundImage:
          'radial-gradient(120% 60% at 0% 0%, rgba(86,70,230,0.22), transparent 60%)',
      }}
    >
      <div className="flex items-center gap-[11px] px-1.5">
        <span className="w-[34px] h-[34px] rounded-[9px] grid place-items-center text-white flex-none bg-gradient-to-br from-[#6a5bff] to-[#4536c9] shadow-[0_6px_16px_-6px_#5646e6]">
          <Icon name="inbox" size={19} strokeWidth={2} />
        </span>
        <span>
          <span className="block font-display font-bold text-[18px] leading-none">Triage</span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-onrail-soft">
            Ticket Workspace
          </span>
        </span>
      </div>

      <div>
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-onrail-soft px-2 pb-2">
          Queues
        </div>
        <button
          className={`${railBtn} ${
            statusFilter === 'all'
              ? 'bg-rail-soft text-onrail'
              : 'text-onrail-soft hover:bg-white/[0.06] hover:text-onrail'
          }`}
          onClick={() => onStatusFilter('all')}
        >
          <Icon name="inbox" size={18} className="flex-none" />
          All tickets
          <span className="ml-auto font-mono text-xs text-onrail-soft">{countFor('all')}</span>
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`${railBtn} ${
              statusFilter === status
                ? 'bg-rail-soft text-onrail'
                : 'text-onrail-soft hover:bg-white/[0.06] hover:text-onrail'
            }`}
            onClick={() => onStatusFilter(status)}
          >
            <span className={`w-2 h-2 rounded-full flex-none ${STATUS_DOT[status]}`} />
            {status}
            <span className="ml-auto font-mono text-xs text-onrail-soft">{countFor(status)}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-[9px] rounded-[10px] bg-white/[0.04] px-3 py-2.5 text-[12.5px] text-onrail-soft">
        <span
          className={`w-2 h-2 rounded-full flex-none ${
            health === 'down'
              ? 'bg-high shadow-[0_0_0_4px_rgba(229,72,77,0.18)]'
              : 'bg-[#36c08a] shadow-[0_0_0_4px_rgba(54,192,138,0.18)]'
          }`}
        />
        {health === 'down' ? 'Backend offline' : 'Backend connected'}
      </div>
    </aside>
  );
}
