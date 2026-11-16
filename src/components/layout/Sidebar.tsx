import { MessageSquarePlus, PanelLeftClose } from 'lucide-react';
import { useApp } from '../../state/store';
import { Orb } from '../brand/Orb';
import { APP_NAME } from '../../config';

/** Barre latérale repliable avec l'historique des conversations. */
export function Sidebar() {
  const app = useApp();
  const { sidebarOpen, setSidebarOpen, convs, activeId, view } = app;

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <nav
        aria-label="Historique des conversations"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-line bg-surface-2 transition-transform duration-300 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 px-4">
          <Orb size={26} />
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Replier la barre latérale"
            className="ml-auto rounded-full p-1.5 text-muted transition-colors hover:bg-line/60 hover:text-ink"
          >
            <PanelLeftClose size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={() => app.newConversation()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-line/60"
          >
            <MessageSquarePlus size={17} strokeWidth={1.75} /> Nouvelle conversation
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <h2 className="px-3 pb-1.5 text-xs font-medium text-muted">Conversations</h2>
          <ul className="space-y-0.5">
            {convs.map((c) => {
              const on = view === 'chat' && c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => app.openConv(c.id)}
                    aria-current={on ? 'page' : undefined}
                    className={`block w-full truncate rounded-xl px-3 py-2 text-left text-sm transition-colors ${on ? 'bg-line/70 text-ink' : 'text-muted hover:bg-line/50 hover:text-ink'}`}
                  >
                    {c.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="border-t border-line px-6 py-3 text-[11px] leading-snug text-muted">Maquette · réponses simulées · impacts en ordres de grandeur illustratifs</p>
      </nav>
    </>
  );
}
