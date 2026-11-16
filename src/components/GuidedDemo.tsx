import { useState } from 'react';
import { ChevronLeft, ChevronRight, Minimize2, PlayCircle, X } from 'lucide-react';
import { FEATURES } from '../lib/features';
import { SCENARIOS, useApp } from '../state/store';
import { btn, btnAccent } from './ui';

/**
 * DÉMO GUIDÉE — parcourt les 13 fonctionnalités. Panneau flottant NON bloquant (repliable).
 * « Montrer » prépare l'écran ou le scénario correspondant.
 */
export function GuidedDemo() {
  const app = useApp();
  const [min, setMin] = useState(false);
  const step = app.demoStep;
  const f = FEATURES[step];

  const show = (n: number) => {
    switch (n) {
      case 1:
        return app.runScenario(1);
      case 2:
        return app.runScenario(4); // long fil : estimation en ambre doux
      case 3:
        return app.runScenario(2);
      case 4:
      case 6:
        return app.runScenario(1, true); // envoie la question : note d'impact et « Développer »
      case 5:
        return app.runScenario(4);
      case 7:
        return app.runScenario(5);
      case 8:
        return app.runScenario(3);
      case 9:
        return app.setShowOnboarding(true);
      case 10:
        return app.setView('usage');
      case 11:
        return app.setView('defis');
      case 12:
        return app.setView('reglages');
      case 13:
        return app.openConv(null);
    }
  };

  const go = (i: number) => {
    app.setDemoStep(i);
    show(FEATURES[i].n);
  };

  if (min) {
    return (
      <button onClick={() => setMin(false)} className={`${btnAccent} fixed bottom-4 right-4 z-[55] shadow-xl`}>
        <PlayCircle size={16} aria-hidden="true" /> Démo · {f.n}/13
      </button>
    );
  }

  return (
    <aside aria-label="Démo guidée" className="reveal fixed inset-x-3 bottom-3 z-[55] rounded-3xl border border-line bg-surface p-4 text-ink shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-accent-ink">Démo guidée · {f.n}/13</span>
        <button onClick={() => setMin(true)} aria-label="Réduire la démo" className="ml-auto rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
          <Minimize2 size={15} />
        </button>
        <button onClick={() => app.setDemoOpen(false)} aria-label="Fermer la démo" className="rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
          <X size={15} />
        </button>
      </div>
      <h2 className="mt-2 text-base font-semibold leading-snug">{f.title}</h2>
      <p className="mt-1 text-xs text-muted">Levier : {f.lever}</p>
      <p className="mt-2 text-sm leading-relaxed">{f.show}</p>
      <div className="mt-4 flex items-center gap-2">
        <button className={btnAccent} onClick={() => show(f.n)}>
          Montrer
        </button>
        <button className={btn} onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} aria-label="Fonctionnalité précédente">
          <ChevronLeft size={16} />
        </button>
        <button className={btn} onClick={() => go(Math.min(FEATURES.length - 1, step + 1))} disabled={step === FEATURES.length - 1} aria-label="Fonctionnalité suivante">
          <ChevronRight size={16} />
        </button>
      </div>
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-muted hover:text-ink">Les 5 scénarios prédéfinis</summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button key={s.n} onClick={() => app.runScenario(s.n)} className="rounded-full border border-line px-2.5 py-1 text-muted hover:bg-surface-2 hover:text-ink">
              {s.n}. {s.label}
            </button>
          ))}
        </div>
      </details>
    </aside>
  );
}
