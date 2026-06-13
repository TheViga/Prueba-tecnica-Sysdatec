import { Avatar } from './Chips.jsx';

export default function AgentSelector({ agents, onSelect }) {
  return (
    <div className="fixed inset-0 z-[60] bg-[rgba(20,18,30,0.55)] backdrop-blur-[3px] flex items-center justify-center p-4">
      <div className="bg-canvas rounded-card border border-line shadow-xl w-full max-w-sm p-6 flex flex-col gap-5 animate-fade-in">
        <div>
          <h2 className="text-[18px] font-bold">Who are you?</h2>
          <p className="text-[13px] text-ink-soft mt-1">
            Select your profile to comment on tickets.
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {agents.map((agent) => (
            <li key={agent.id}>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-field border border-line hover:border-accent hover:bg-surface transition-colors text-left"
                onClick={() => onSelect(agent)}
              >
                <Avatar name={agent.name} />
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold truncate">{agent.name}</p>
                  <p className="text-[12px] text-ink-faint truncate">{agent.email}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
