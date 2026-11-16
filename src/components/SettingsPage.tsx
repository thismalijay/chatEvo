import { useState, type ReactNode } from 'react';
import { Brain, ChevronDown, Leaf, Monitor, Moon, Scale, Sun } from 'lucide-react';
import type { ModeId, NudgeKey, ThemePref } from '../lib/types';
import { MODES, MODE_ORDER } from '../lib/energy';
import { FEATURES, NUDGE_LABELS } from '../lib/features';
import { FRIENDS } from '../data/demoData';
import { useApp } from '../state/store';
import { Toggle, btn } from './ui';

/**
 * Feature 12 — RÉGLAGES : transparence, autonomie, réversibilité totale.
 * Chaque nudge est désactivable ; tout défaut se change ; le partage se contrôle.
 */

const MODE_ICONS: Record<ModeId, typeof Leaf> = { rapide: Leaf, equilibre: Scale, approfondi: Brain };
const THEMES: { id: ThemePref; label: string; Icon: typeof Sun }[] = [
  { id: 'clair', label: 'Clair', Icon: Sun },
  { id: 'sombre', label: 'Sombre', Icon: Moon },
  { id: 'auto', label: 'Automatique', Icon: Monitor },
];
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

function Section({ title, sub, children, delay = 0 }: { title: string; sub?: string; children: ReactNode; delay?: number }) {
  return (
    <section className="reveal rounded-3xl border border-line bg-surface p-5 sm:p-6" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="text-base font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span>
        <span id={id} className="block text-sm font-medium">
          {label}
        </span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const app = useApp();
  const { prefs, updatePrefs } = app;
  const [openWhy, setOpenWhy] = useState<string | null>(null);
  const groups = app.challenges.filter((c) => c.status === 'en cours' || c.status === 'en pause');

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-4">
        <h1 className="text-3xl font-semibold tracking-tight">Réglages</h1>

        <Section title="Réglages par défaut" sub="Vous pouvez choisir un autre défaut à tout moment.">
          <fieldset>
            <legend className="text-sm font-medium">Mode par défaut</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {MODE_ORDER.map((m) => {
                const on = prefs.defaultMode === m;
                const Icon = MODE_ICONS[m];
                return (
                  <label key={m} className={`cursor-pointer rounded-2xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-accent ${on ? 'border-accent bg-mint' : 'border-line hover:bg-surface-2'}`}>
                    <input
                      type="radio"
                      name="defaultMode"
                      className="sr-only"
                      checked={on}
                      onChange={() => {
                        updatePrefs({ defaultMode: m });
                        app.setMode(m, false);
                      }}
                    />
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon size={15} strokeWidth={1.75} aria-hidden="true" /> {MODES[m].label}
                    </span>
                    <span className="mt-1 block text-xs text-muted">{MODES[m].ideal}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-3 divide-y divide-line">
            <Row id="set-short" label="Réponses courtes par défaut" hint="« Développer » reste disponible sous chaque réponse">
              <Toggle checked={prefs.shortAnswers} onChange={(v) => updatePrefs({ shortAnswers: v })} labelledBy="set-short" />
            </Row>
          </div>
        </Section>

        <Section title="Suggestions et informations" sub="Chaque nudge se désactive individuellement." delay={60}>
          <div className="divide-y divide-line">
            {(Object.keys(NUDGE_LABELS) as NudgeKey[]).map((k) => (
              <Row key={k} id={`nudge-${k}`} label={NUDGE_LABELS[k].label} hint={NUDGE_LABELS[k].hint}>
                <Toggle checked={prefs.nudges[k]} onChange={(v) => app.setNudge(k, v)} labelledBy={`nudge-${k}`} />
              </Row>
            ))}
            <Row id="set-day" label="Jour du bilan hebdomadaire">
              <select
                aria-labelledby="set-day"
                value={prefs.reportDay}
                onChange={(e) => updatePrefs({ reportDay: e.target.value })}
                className="rounded-xl border border-line bg-bg px-3 py-1.5 text-sm"
              >
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Row>
          </div>
        </Section>

        <Section title="Apparence" delay={100}>
          <div role="radiogroup" aria-label="Thème" className="flex flex-wrap gap-2">
            {THEMES.map(({ id, label, Icon }) => (
              <button
                key={id}
                role="radio"
                aria-checked={prefs.theme === id}
                onClick={() => updatePrefs({ theme: id })}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${prefs.theme === id ? 'border-accent bg-mint text-ink' : 'border-line text-muted hover:text-ink'}`}
              >
                <Icon size={15} strokeWidth={1.75} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">« Mon usage » et « Défis » restent en ambiance sombre « dashboard ».</p>
        </Section>

        <Section title="Confidentialité et partage" sub="Vous contrôlez ce que vous partagez, et avec qui." delay={140}>
          <div className="divide-y divide-line">
            <Row id="set-friends" label="Comparaison entre amis" hint={prefs.friendsSharing ? `Visible par : ${FRIENDS.filter((f) => prefs.sharedFriendIds.includes(f.id)).map((f) => f.name).join(', ') || 'personne'}` : 'Désactivée'}>
              <Toggle checked={prefs.friendsSharing} onChange={(v) => updatePrefs({ friendsSharing: v })} labelledBy="set-friends" />
            </Row>
            <Row id="set-modes" label="Partager ma répartition des modes">
              <Toggle checked={prefs.shareModes} onChange={(v) => updatePrefs({ shareModes: v })} labelledBy="set-modes" />
            </Row>
            <Row id="set-curve" label="Partager ma courbe d'usage">
              <Toggle checked={prefs.shareCurve} onChange={(v) => updatePrefs({ shareCurve: v })} labelledBy="set-curve" />
            </Row>
            <Row id="set-group" label="Partager ma consommation avec mes groupes de défi" hint="Seul le total collectif est affiché, jamais votre part">
              <Toggle checked={prefs.groupSharing} onChange={(v) => updatePrefs({ groupSharing: v })} labelledBy="set-group" />
            </Row>
          </div>
          {groups.length > 0 && (
            <ul className="mt-3 space-y-2">
              {groups.map((g) => (
                <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-2 px-4 py-2.5 text-sm">
                  <span>
                    {g.title} <span className="text-muted">· {g.status}</span>
                  </span>
                  <button className={btn} onClick={() => app.updateChallenge(g.id, { status: 'quitté' })}>
                    Quitter ce groupe
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Pourquoi ces choix ?" sub="Chaque fonctionnalité, son levier et son bénéfice pour vous." delay={180}>
          <ul className="divide-y divide-line">
            {FEATURES.map((f) => {
              const open = openWhy === f.id;
              return (
                <li key={f.id}>
                  <button onClick={() => setOpenWhy(open ? null : f.id)} aria-expanded={open} className="flex w-full items-center gap-3 py-3 text-left text-sm">
                    <span className="w-6 shrink-0 text-xs text-muted">{f.n}.</span>
                    <span className="flex-1 font-medium">{f.title}</span>
                    <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {open && (
                    <div className="reveal pb-3 pl-9 text-sm">
                      <p className="leading-relaxed">{f.why}</p>
                      <p className="mt-1 text-xs text-muted">Levier : {f.lever}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Démo et données" delay={220}>
          <div className="flex flex-wrap gap-2">
            <button className={btn} onClick={() => app.setDemoOpen(true)}>
              Lancer la démo guidée
            </button>
            <button className={btn} onClick={() => app.setShowOnboarding(true)}>
              Revoir le didacticiel
            </button>
            <button className={btn} onClick={app.resetAll}>
              Réinitialiser les données de démo
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
