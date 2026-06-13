import { useEffect, useMemo, useState } from 'react';
import Icon from './components/Icon.jsx';
import Sidebar from './components/Sidebar.jsx';
import Board from './components/Board.jsx';
import TicketTable from './components/TicketTable.jsx';
import TicketDetail from './components/TicketDetail.jsx';
import NewTicketModal from './components/NewTicketModal.jsx';
import AgentSelector from './components/AgentSelector.jsx';
import { Avatar } from './components/Chips.jsx';
import { api } from './api/client.js';
import { btnPrimary, btnGhost } from './lib/ui.js';

const segBtn =
  'flex items-center gap-1.5 rounded-[7px] px-[11px] py-1.5 text-[13px] font-medium transition-colors';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState(() => {
    try {
      const saved = localStorage.getItem('triage_current_agent');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectingAgent, setSelectingAgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [health, setHealth] = useState('ok');

  const [view, setView] = useState('board'); // 'board' | 'list'
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);

  async function load({ silent } = {}) {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await api.listTickets();
      setTickets(data);
      setHealth('ok');
    } catch (err) {
      setError(err.message);
      setHealth('down');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // The support team rarely changes, so fetch it once.
    api.listAgents().then(setAgents).catch(() => setAgents([]));
  }, []);

  function handleSelectAgent(agent) {
    localStorage.setItem('triage_current_agent', JSON.stringify(agent));
    setCurrentAgent(agent);
    setSelectingAgent(false);
  }

  async function createTicket(data) {
    const created = await api.createTicket(data);
    setTickets((prev) => [created, ...prev]);
    // The detail view re-fetches, so opening it shows the freshest data.
    setOpenId(created.id);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== 'all' && (t.status || 'Open') !== statusFilter) return false;
      if (!q) return true;
      return [t.customerName, t.requestText, t.summary, t.category, t.owner]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    });
  }, [tickets, statusFilter, query]);

  const heading = statusFilter === 'all' ? 'All tickets' : statusFilter;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[244px_1fr] h-screen overflow-hidden">
      <Sidebar
        tickets={tickets}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        health={health}
      />

      <main className="flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center flex-wrap gap-[18px] px-4 md:px-7 pt-5 pb-[18px] border-b border-line bg-canvas">
          <div>
            <h1 className="text-[22px] font-bold">{heading}</h1>
            <p className="mt-[3px] text-[13px] text-ink-soft">
              {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
              {query ? ` matching “${query}”` : ''}
            </p>
          </div>

          <div className="flex-1" />

          <div className="relative flex items-center">
            <Icon name="search" size={16} className="absolute left-3 text-ink-faint pointer-events-none" />
            <input
              type="search"
              placeholder="Search tickets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tickets"
              className="w-40 md:w-60 rounded-field border border-line-strong bg-surface pl-9 pr-3 py-[9px] text-sm transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/30"
            />
          </div>

          <div className="inline-flex bg-surface border border-line-strong rounded-field p-[3px]" role="tablist" aria-label="View">
            <button
              className={`${segBtn} ${view === 'board' ? 'bg-ink text-white' : 'text-ink-soft'}`}
              onClick={() => setView('board')}
              aria-pressed={view === 'board'}
            >
              <Icon name="board" size={15} />
              Board
            </button>
            <button
              className={`${segBtn} ${view === 'list' ? 'bg-ink text-white' : 'text-ink-soft'}`}
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
            >
              <Icon name="list" size={15} />
              List
            </button>
          </div>

          <button className={btnPrimary} onClick={() => setCreating(true)}>
            <Icon name="plus" size={16} />
            New ticket
          </button>

          {currentAgent && (
            <button
              className="flex items-center gap-2 rounded-field border border-line bg-surface px-2.5 py-1.5 hover:border-accent transition-colors"
              onClick={() => setSelectingAgent(true)}
              title="Switch agent"
            >
              <Avatar name={currentAgent.name} />
              <span className="text-[13px] font-medium max-w-[96px] truncate">{currentAgent.name}</span>
            </button>
          )}
        </header>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <LoadingState view={view} />
          ) : error ? (
            <StateMessage
              variant="error"
              icon="alert"
              title="Can’t load tickets"
              message={error}
            >
              <button className={btnGhost} onClick={() => load()}>
                <Icon name="refresh" size={15} />
                Try again
              </button>
            </StateMessage>
          ) : filtered.length === 0 ? (
            <EmptyState hasTickets={tickets.length > 0} onCreate={() => setCreating(true)} />
          ) : view === 'board' ? (
            <Board tickets={filtered} onOpen={setOpenId} />
          ) : (
            <TicketTable tickets={filtered} onOpen={setOpenId} />
          )}
        </div>
      </main>

      {openId && (
        <TicketDetail
          ticketId={openId}
          agents={agents}
          currentAgent={currentAgent}
          onClose={() => setOpenId(null)}
          onChanged={() => load({ silent: true })}
        />
      )}

      {creating && <NewTicketModal onClose={() => setCreating(false)} onCreate={createTicket} />}

      {(selectingAgent || (!currentAgent && agents.length > 0)) && (
        <AgentSelector agents={agents} onSelect={handleSelectAgent} />
      )}
    </div>
  );
}

function StateMessage({ variant, icon, title, message, children }) {
  const iconWrap =
    variant === 'error'
      ? 'bg-high-soft text-high border-transparent'
      : 'bg-surface text-ink-faint border-line';
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 text-center h-full p-10 text-ink-soft">
      <div className={`w-14 h-14 rounded-2xl grid place-items-center border ${iconWrap}`}>
        <Icon name={icon} size={24} />
      </div>
      <h3 className="text-[17px] text-ink">{title}</h3>
      <p className="text-[13.5px] max-w-[320px] leading-relaxed">{message}</p>
      {children}
    </div>
  );
}

function LoadingState({ view }) {
  if (view === 'list') {
    return (
      <div className="p-4 md:px-7 md:pt-[22px]">
        <div className="skeleton h-[320px]" />
      </div>
    );
  }
  return (
    <div className="grid grid-flow-row md:grid-flow-col md:auto-cols-[minmax(290px,1fr)] gap-[18px] p-4 md:px-7 md:pt-[22px] md:pb-10 items-start">
      {[0, 1, 2, 3].map((col) => (
        <section key={col} className="bg-surface-soft border border-line rounded-card flex flex-col">
          <header className="flex items-center gap-2.5 px-[15px] pt-3.5 pb-3 border-b border-line">
            <span className="w-[9px] h-[9px] rounded-[3px] bg-line-strong" />
            <span className="font-display font-semibold text-sm text-ink-faint">Loading</span>
          </header>
          <div className="p-3 flex flex-col gap-3">
            <div className="skeleton h-[132px]" />
            <div className="skeleton h-[132px]" />
          </div>
        </section>
      ))}
    </div>
  );
}

function EmptyState({ hasTickets, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 text-center h-full p-10 text-ink-soft">
      <div className="w-14 h-14 rounded-2xl grid place-items-center border bg-surface text-ink-faint border-line">
        <Icon name="inbox" size={24} />
      </div>
      <h3 className="text-[17px] text-ink">{hasTickets ? 'Nothing matches' : 'No tickets yet'}</h3>
      <p className="text-[13.5px] max-w-[320px] leading-relaxed">
        {hasTickets
          ? 'Try a different search or queue filter.'
          : 'Create your first ticket and it gets triaged automatically.'}
      </p>
      {!hasTickets && (
        <button className={btnPrimary} onClick={onCreate}>
          <Icon name="plus" size={16} />
          New ticket
        </button>
      )}
    </div>
  );
}
