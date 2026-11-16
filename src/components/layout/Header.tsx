import { BarChart3, Monitor, Moon, PanelLeftOpen, PlayCircle, Settings, Sun, Users } from 'lucide-react';
import type { ThemePref, View } from '../../lib/types';
import { useApp } from '../../state/store';
import { Orb } from '../brand/Orb';
import { APP_NAME } from '../../config';

const NAV: { view: View; label: string; Icon: typeof BarChart3 }[] = [
  { view: 'usage', label: 'Mon usage', Icon: BarChart3 },
  { view: 'defis', label: 'Défis', Icon: Users },
  { view: 'reglages', label: 'Réglages', Icon: Settings },
];

const THEMES: { id: ThemePref; label: string; Icon: typeof Sun }[] = [
  { id: 'clair', label: 'Clair', Icon: Sun },
  { id: 'sombre', label: 'Sombre', Icon: Moon },
  { id: 'auto', label: 'Automatique', Icon: Monitor },
];

/** En-tête sobre : accès à Mon usage, Défis, Réglages, au thème et à la démo guidée. */
export function Header() {
  const app = useApp();
  const theme = THEMES.find((t) => t.id === app.prefs.theme) ?? THEMES[0];
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 px-3 sm:px-4">
      {!app.sidebarOpen && (
        <>
          <button
            onClick={() => app.setSidebarOpen(true)}
            aria-label="Ouvrir la barre latérale"
            className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <PanelLeftOpen size={18} strokeWidth={1.75} />
          </button>
          <button onClick={() => app.openConv(null)} className="ml-1 flex items-center gap-2 rounded-full px-1 py-1" aria-label={`${APP_NAME}, accueil`}>
            <Orb size={24} />
            <span className="hidden font-semibold tracking-tight sm:inline">{APP_NAME}</span>
          </button>
        </>
      )}

      <nav aria-label="Navigation principale" className="ml-auto flex items-center gap-0.5">
        {NAV.map(({ view, label, Icon }) => {
          const on = app.view === view;
          return (
            <button
              key={view}
              onClick={() => app.setView(on ? 'chat' : view)}
              aria-current={on ? 'page' : undefined}
              aria-label={label}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ${
                on ? 'bg-surface-2 text-ink ring-1 ring-line' : 'text-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <button
          onClick={() => app.updatePrefs({ theme: next.id })}
          aria-label={`Thème : ${theme.label}. Passer à ${next.label}`}
          title={`Thème : ${theme.label}`}
          className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <theme.Icon size={16} strokeWidth={1.75} />
        </button>
        <button
          onClick={() => app.setDemoOpen(!app.demoOpen)}
          aria-pressed={app.demoOpen}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <PlayCircle size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden sm:inline">Démo guidée</span>
        </button>
      </nav>
    </header>
  );
}
