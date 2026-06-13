import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { PriorityChip, CategoryChip, AiPill, Avatar } from './Chips.jsx';
import { api } from '../api/client.js';
import { STATUSES } from '../lib/constants.js';
import { fullDate, timeAgo } from '../lib/format.js';
import { btnGhost, btnPrimary, inputBase, fieldLabel, eyebrow, blockHeading, banner } from '../lib/ui.js';

const closeBtn =
  'ml-auto w-[34px] h-[34px] rounded-[9px] grid place-items-center text-ink-soft flex-none transition-colors hover:bg-surface-soft';

export default function TicketDetail({ ticketId, agents = [], currentAgent = null, onClose, onChanged }) {
  const [ticket, setTicket] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false); // status/owner/reclassify in flight

  // Comment composer
  const [body, setBody] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;
    setTicket(null);
    setLoadError('');
    api
      .getTicket(ticketId)
      .then((data) => active && setTicket(data))
      .catch((err) => active && setLoadError(err.message));
    return () => {
      active = false;
    };
  }, [ticketId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function patch(changes) {
    setBusy(true);
    setActionError('');
    try {
      const updated = await api.updateTicket(ticketId, changes);
      setTicket((prev) => ({ ...prev, ...updated }));
      onChanged?.();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function reclassify() {
    setBusy(true);
    setActionError('');
    setTicket((prev) => ({ ...prev, aiStatus: 'processing' }));
    try {
      const updated = await api.reclassify(ticketId);
      setTicket((prev) => ({ ...prev, ...updated }));
      onChanged?.();
    } catch (err) {
      setActionError(err.message);
      setTicket((prev) => ({ ...prev, aiStatus: 'failed' }));
    } finally {
      setBusy(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!currentAgent || !body.trim()) return;
    setCommenting(true);
    setActionError('');
    try {
      const comment = await api.addComment(ticketId, { author: currentAgent.name, body: body.trim() });
      setTicket((prev) => ({ ...prev, comments: [...(prev.comments || []), comment] }));
      setBody('');
      onChanged?.();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCommenting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-[rgba(20,18,30,0.42)] backdrop-blur-[2px] z-40 animate-fade-in"
        onClick={onClose}
      />
      <aside
        className="fixed top-0 right-0 h-screen w-[min(520px,100vw)] bg-canvas z-50 flex flex-col shadow-lg animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-label="Ticket detail"
      >
        {!ticket && !loadError && <DrawerSkeleton onClose={onClose} />}

        {loadError && (
          <>
            <div className="flex items-start gap-3 px-[22px] pt-5 pb-4 border-b border-line">
              <button className={closeBtn} onClick={onClose} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>
            <div className="px-[22px] pt-5">
              <div className={banner}>
                <Icon name="alert" size={16} className="flex-none" />
                {loadError}
              </div>
            </div>
          </>
        )}

        {ticket && (
          <>
            <header className="flex items-start gap-3 px-[22px] pt-5 pb-4 border-b border-line">
              <div className="min-w-0">
                <span className={eyebrow}>Ticket #{ticket.id.slice(0, 8)}</span>
                <h2 className="text-[19px] mt-1.5">{ticket.customerName}</h2>
              </div>
              <button className={closeBtn} onClick={onClose} aria-label="Close">
                <Icon name="close" />
              </button>
            </header>

            <div className="flex-1 overflow-auto px-[22px] pt-5 pb-7 flex flex-col gap-5">
              {actionError && (
                <div className={banner}>
                  <Icon name="alert" size={16} className="flex-none" />
                  {actionError}
                </div>
              )}

              {/* AI insight */}
              <div className="border border-line rounded-card bg-surface p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="sparkles" size={16} className="text-accent" />
                  <h3 className="font-mono text-[13px] tracking-[0.08em] uppercase text-ink-soft font-semibold">
                    AI Triage
                  </h3>
                  <span className="ml-auto">
                    <AiPill status={ticket.aiStatus} />
                  </span>
                </div>
                <p
                  className={`text-[14.5px] leading-relaxed ${
                    ticket.summary ? 'text-ink' : 'text-ink-faint italic'
                  }`}
                >
                  {ticket.summary ||
                    (ticket.aiStatus === 'failed'
                      ? 'Classification did not complete. Re-run triage to try again.'
                      : 'Not classified yet.')}
                </p>
                {(ticket.priority || ticket.category) && (
                  <div className="flex flex-wrap gap-2 mt-3.5">
                    <PriorityChip value={ticket.priority} />
                    <CategoryChip value={ticket.category} />
                  </div>
                )}
                <div className="flex items-center gap-2.5 mt-3.5 pt-3.5 border-t border-line">
                  <button className={btnGhost} onClick={reclassify} disabled={busy}>
                    <Icon name="refresh" size={15} className={busy ? 'animate-spin' : ''} />
                    {ticket.aiStatus === 'done' ? 'Re-run triage' : 'Run triage'}
                  </button>
                </div>
              </div>

              {/* Request */}
              <div>
                <h3 className={blockHeading}>Request</h3>
                <div className="bg-surface border border-line rounded-field px-3.5 py-[13px] text-sm leading-relaxed text-ink whitespace-pre-wrap break-words">
                  {ticket.requestText}
                </div>
                {ticket.attachmentUrl && (
                  <a
                    className="inline-flex items-center gap-[7px] mt-2.5 text-[13px] text-accent font-medium break-all"
                    href={ticket.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="link" size={14} className="flex-none" />
                    {ticket.attachmentUrl}
                  </a>
                )}
              </div>

              {/* Workflow */}
              <div>
                <h3 className={blockHeading}>Workflow</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="status" className={fieldLabel}>
                      Status
                    </label>
                    <select
                      id="status"
                      className={inputBase}
                      value={ticket.status || 'Open'}
                      disabled={busy}
                      onChange={(e) => patch({ status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="owner" className={fieldLabel}>
                      Owner
                    </label>
                    <select
                      id="owner"
                      className={inputBase}
                      value={ticket.owner || ''}
                      disabled={busy}
                      onChange={(e) => patch({ owner: e.target.value || null })}
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                      {/* Keep a legacy/free-text owner selectable if it isn't in the team list. */}
                      {ticket.owner && !agents.some((a) => a.name === ticket.owner) && (
                        <option value={ticket.owner}>{ticket.owner}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className={blockHeading}>Activity</h3>
                <div className="flex flex-col gap-3">
                  {(ticket.comments || []).length === 0 && (
                    <p className="text-[13px] text-ink-faint py-1">No comments yet.</p>
                  )}
                  {(ticket.comments || []).map((c) => (
                    <div className="flex gap-[11px]" key={c.id}>
                      <Avatar name={c.author} />
                      <div className="bg-surface border border-line rounded-field px-3 py-2.5 flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-[13px]">{c.author}</span>
                          <span
                            className="font-mono text-[11px] text-ink-faint"
                            title={fullDate(c.createdAt)}
                          >
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                        <div className="text-[13.5px] leading-snug text-ink-soft whitespace-pre-wrap break-words">
                          {c.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="flex flex-col gap-2.5 mt-3" onSubmit={submitComment}>
                  {currentAgent ? (
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-surface border border-line rounded-field">
                      <Avatar name={currentAgent.name} />
                      <span className="text-[13px] font-semibold">{currentAgent.name}</span>
                      <span className="text-[12px] text-ink-faint">{currentAgent.email}</span>
                    </div>
                  ) : (
                    <p className="text-[13px] text-ink-faint italic">Select a profile to comment.</p>
                  )}
                  <textarea
                    className={`${inputBase} resize-y min-h-[80px] leading-snug`}
                    placeholder="Add a comment…"
                    value={body}
                    rows={3}
                    onChange={(e) => setBody(e.target.value)}
                    aria-label="Comment"
                    disabled={!currentAgent}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={btnPrimary}
                      disabled={commenting || !currentAgent || !body.trim()}
                    >
                      <Icon name="message" size={15} />
                      {commenting ? 'Posting…' : 'Comment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function DrawerSkeleton({ onClose }) {
  return (
    <>
      <div className="flex items-start gap-3 px-[22px] pt-5 pb-4 border-b border-line">
        <div className="min-w-0">
          <span className={eyebrow}>Loading…</span>
          <h2 className="text-[19px] mt-1.5 text-ink-faint">Fetching ticket</h2>
        </div>
        <button className={closeBtn} onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>
      <div className="flex-1 overflow-auto px-[22px] pt-5 pb-7 flex flex-col gap-5">
        <div className="skeleton h-[150px]" />
        <div className="skeleton h-[90px]" />
        <div className="skeleton h-[120px]" />
      </div>
    </>
  );
}
