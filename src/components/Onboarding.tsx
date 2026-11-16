import { useEffect, useRef, useState } from 'react';
import { AlignLeft, Cpu, MessagesSquare } from 'lucide-react';
import { useApp } from '../state/store';
import { WaterTexture } from './brand/WaterTexture';
import { Orb } from './brand/Orb';
import { Toggle, btn, btnPrimary, link } from './ui';
import { APP_NAME } from '../config';

/**
 * Feature 9 — DIDACTICIEL DE PREMIER USAGE (3 écrans, passable).
 * Leviers : moment de transition (habit discontinuity), engagement et cohérence avec ses valeurs, nouveau statu quo.
 * Réaffiché lors d'un changement de version (APP_VERSION).
 */

const VALUES = ["l'environnement", 'la rapidité', 'la qualité des réponses', 'la simplicité'];

const CONSUMES = [
  { Icon: Cpu, title: 'Le modèle choisi', text: 'Un modèle de raisonnement peut consommer 25 à 100 fois plus qu’un modèle léger.', bars: [0.04, 0.06, 1], labels: ['0,2 Wh', '0,3 Wh', '5–30 Wh'] },
  { Icon: AlignLeft, title: 'La longueur des réponses', text: 'Chaque mot généré demande du calcul. Une réponse courte suffit souvent.', bars: [0.3, 1], labels: ['Courte', 'Développée'] },
  { Icon: MessagesSquare, title: 'La longueur des conversations', text: 'Toute la conversation est relue à chaque message.', bars: [0.2, 0.45, 0.75, 1], labels: ['', '', '', ''] },
];

export function Onboarding() {
  const app = useApp();
  const [step, setStep] = useState(0);
  const [shortAnswers, setShort] = useState(app.prefs.shortAnswers);
  const [lightModel, setLight] = useState(app.prefs.defaultMode === 'rapide');
  const [autoNew, setAutoNew] = useState(app.prefs.nudges.newConv);
  const [values, setValues] = useState<string[]>(app.prefs.values.length ? app.prefs.values : ["l'environnement"]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isUpdate = app.prefs.onboardedVersion !== null;

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const finish = () =>
    app.finishOnboarding({
      shortAnswers,
      defaultMode: lightModel ? 'rapide' : 'equilibre',
      values,
      nudges: { ...app.prefs.nudges, newConv: autoNew },
    });

  const choices = [shortAnswers && 'des réponses courtes par défaut', lightModel && 'le modèle léger par défaut', autoNew && 'une suggestion de nouvelle conversation quand le sujet change'].filter(Boolean) as string[];
  const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} et ${xs[xs.length - 1]}`);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg text-ink">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-6 sm:py-10">
        <div className="flex items-center gap-2.5">
          <Orb size={28} />
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
          <span className="ml-auto text-xs text-muted" aria-live="polite">
            Étape {step + 1} sur 3
          </span>
          {step < 2 && (
            <button className={`${link} ml-3`} onClick={finish}>
              Passer
            </button>
          )}
        </div>

        <main className="mt-6 flex-1">
          {step === 0 && (
            <section className="reveal">
              <div className="relative h-40 overflow-hidden rounded-3xl">
                <WaterTexture seed={3} />
                <div className="absolute inset-0 bg-[rgba(8,20,15,0.35)]" />
                <p className="absolute bottom-4 left-5 text-sm text-white/90">{isUpdate ? 'Nouvelle version : un rappel rapide.' : 'Bienvenue.'}</p>
              </div>
              <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-3xl font-semibold tracking-tight">
                Ce qui consomme vraiment
              </h1>
              <p className="mt-2 text-muted">Trois choses font varier l'énergie d'un échange avec une IA.</p>
              <ul className="mt-6 space-y-3">
                {CONSUMES.map(({ Icon, title, text, bars, labels }, i) => (
                  <li key={title} className="reveal flex items-center gap-4 rounded-2xl border border-line bg-surface p-4" style={{ animationDelay: `${120 + i * 80}ms` }}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-accent-ink">
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted">{text}</p>
                    </div>
                    <div className="hidden h-12 items-end gap-1.5 sm:flex" aria-hidden="true">
                      {bars.map((b, j) => (
                        <div key={j} className="flex flex-col items-center gap-1">
                          <div className="w-5 rounded-md bg-accent/70" style={{ height: Math.max(4, b * 36) }} />
                          {labels[j] && <span className="text-[9px] text-muted">{labels[j]}</span>}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {step === 1 && (
            <section className="reveal">
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold tracking-tight">
                Vos réglages par défaut
              </h1>
              <p className="mt-2 text-muted">Vous pourrez tout changer à tout moment dans les réglages.</p>
              <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
                {[
                  { id: 'ob-short', label: 'Réponses courtes par défaut', hint: '« Développer » reste à un clic', v: shortAnswers, set: setShort },
                  { id: 'ob-light', label: 'Modèle léger par défaut', hint: 'Sinon : Équilibré', v: lightModel, set: setLight },
                  { id: 'ob-new', label: 'Nouvelle conversation auto', hint: 'Proposée quand le sujet change', v: autoNew, set: setAutoNew },
                ].map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 p-4">
                    <span>
                      <span id={o.id} className="block font-medium">
                        {o.label}
                      </span>
                      <span className="block text-sm text-muted">{o.hint}</span>
                    </span>
                    <Toggle checked={o.v} onChange={o.set} labelledBy={o.id} />
                  </li>
                ))}
              </ul>
              <fieldset className="mt-6">
                <legend className="font-medium">À quoi tenez-vous ?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VALUES.map((v) => {
                    const on = values.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setValues((xs) => (on ? xs.filter((x) => x !== v) : [...xs, v]))}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${on ? 'border-accent bg-mint text-accent-ink' : 'border-line text-muted hover:text-ink'}`}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </section>
          )}

          {step === 2 && (
            <section className="reveal relative overflow-hidden rounded-3xl">
              <WaterTexture seed={2} />
              <div className="absolute inset-0 bg-[rgba(8,20,15,0.45)]" />
              <div className="glass relative m-4 rounded-2xl p-6 text-white sm:m-6 sm:p-8">
                <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  C'est prêt.
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-white/95">
                  {choices.length ? `Vous avez choisi ${list(choices)}` : 'Vous gardez les réglages standards'}
                  {values.length ? `, parce que vous tenez à ${list(values)}.` : '.'}
                </p>
                <p className="mt-4 text-sm text-white/80">Tout reste modifiable dans les réglages, en un clic.</p>
              </div>
            </section>
          )}
        </main>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 0 && (
            <button className={btn} onClick={() => setStep((s) => s - 1)}>
              {step === 2 ? 'Modifier mes choix' : 'Retour'}
            </button>
          )}
          <button className={`${btnPrimary} ml-auto`} onClick={() => (step < 2 ? setStep((s) => s + 1) : finish())}>
            {step < 2 ? 'Continuer' : 'Commencer'}
          </button>
        </div>
      </div>
    </div>
  );
}
