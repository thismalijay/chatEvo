import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, Brain, Calculator, Leaf, Scale, Search } from 'lucide-react';
import type { ModeId } from '../../lib/types';
import {
  AMBER_THRESHOLD,
  computeImpact,
  conversationTokens,
  equivalent,
  estimateTokens,
  EXPECTED_OUT,
  formatWh,
  gaugeFill,
  LONG_PROMPT_CHARS,
  MODE_ORDER,
  MODES,
  modeRank,
} from '../../lib/energy';
import { classify, detectTool, RECOMMENDED, upgradeReason } from '../../lib/router';
import { useApp } from '../../state/store';
import { Tip, WhyTip, btn, link } from '../ui';

const MODE_ICONS: Record<ModeId, typeof Leaf> = { rapide: Leaf, equilibre: Scale, approfondi: Brain };

/** Encart discret et non bloquant au-dessus de la saisie. */
function Hint({ icon, children, actions }: { icon: ReactNode; children: ReactNode; actions: ReactNode }) {
  return (
    <div role="status" className="reveal mb-2 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm">
      <p className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-accent-ink">{icon}</span>
        <span>{children}</span>
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-6">{actions}</div>
    </div>
  );
}

/**
 * ZONE DE SAISIE
 * - Feature 1 (sélecteur de mode) : Timely (EAST), conditions facilitantes, effet de cadrage.
 * - Feature 2 (estimation avant envoi) : saillance (MINDSPACE), Timely ; neutre → ambre doux, jamais rouge.
 * - Feature 3 (routage transparent) : défaut + Easy (EAST), réversible en 1 clic.
 * - Feature 8 (alternatives avant l'IA) : proportionnalité « Avant », rupture d'habitude.
 */
export function Composer({ autoFocus = false }: { autoFocus?: boolean }) {
  const app = useApp();
  const { draft, setDraft, mode, setMode, prefs, active, manual, routedFrom, setRoutedFrom } = app;
  const ta = useRef<HTMLTextAreaElement>(null);
  const [toolDismissed, setToolDismissed] = useState(false);
  const [calcShown, setCalcShown] = useState(false);
  const [suggestDismissed, setSuggestDismissed] = useState(false);

  const complexity = classify(draft);
  const recommended = RECOMMENDED[complexity];
  const tool = prefs.nudges.tools && !app.lastSendHadTool && !toolDismissed ? detectTool(draft) : null;

  // Hauteur automatique, focus quand un scénario remplit la saisie, réinitialisation des encarts
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 240) + 'px';
    if (draft && document.activeElement !== el) el.focus();
    if (!draft) {
      setToolDismissed(false);
      setCalcShown(false);
      setSuggestDismissed(false);
    }
  }, [draft]);

  // Routage automatique UNIQUEMENT si la qualité est équivalente (question simple) et que le mode n'a pas été choisi à la main.
  useEffect(() => {
    if (!prefs.nudges.router || !draft.trim() || manual) return;
    if (complexity === 'simple' && mode !== 'rapide') {
      setRoutedFrom(mode);
      setMode('rapide', false);
    } else if (complexity !== 'simple' && routedFrom) {
      setMode(routedFrom, false);
      setRoutedFrom(null);
    }
  }, [complexity, draft, mode, manual, routedFrom, prefs.nudges.router, setMode, setRoutedFrom]);

  // Estimation avant envoi
  const history = conversationTokens(active);
  const est = computeImpact(mode, history, estimateTokens(draft), prefs.shortAnswers && mode !== 'approfondi' ? EXPECTED_OUT.court : EXPECTED_OUT.long);
  const longThread = gaugeFill(active) >= AMBER_THRESHOLD;
  const longPrompt = draft.length > LONG_PROMPT_CHARS;
  const amber = longThread || longPrompt;

  const showUpgrade = prefs.nudges.router && !suggestDismissed && !!draft.trim() && modeRank(recommended) > modeRank(mode);
  const showDowngrade = prefs.nudges.router && !suggestDismissed && manual && complexity === 'simple' && mode !== 'rapide';
  const showPill = prefs.nudges.router && !!draft.trim() && complexity === 'simple' && mode === 'rapide';

  const submit = () => {
    if (!draft.trim() || app.pending) return;
    app.send(draft, { hadTool: !!tool });
  };

  return (
    <div>
      {/* Feature 8 : alternative avant l'IA */}
      {tool && (
        <Hint
          icon={tool.kind === 'calc' ? <Calculator size={16} strokeWidth={1.75} /> : <Search size={16} strokeWidth={1.75} />}
          actions={
            <>
              <button
                className={btn}
                onClick={() => {
                  if (tool.kind === 'calc') setCalcShown(true);
                  else if (tool.url) window.open(tool.url, '_blank', 'noopener,noreferrer');
                }}
              >
                {tool.action}
              </button>
              <button className={btn} onClick={submit}>
                Demander quand même
              </button>
              <button className={link} onClick={() => setToolDismissed(true)}>
                Masquer
              </button>
              <WhyTip feature="tools" />
            </>
          }
        >
          {tool.message}
          {calcShown && tool.result && (
            <span className="mt-1 block font-medium">
              = {tool.result} <span className="font-normal text-muted">· calculé sur votre appareil, sans IA</span>
            </span>
          )}
        </Hint>
      )}

      {/* Feature 3 : suggestion vers un mode plus complet, avec la raison */}
      {!tool && showUpgrade && (
        <Hint
          icon={(() => {
            const I = MODE_ICONS[recommended];
            return <I size={16} strokeWidth={1.75} />;
          })()}
          actions={
            <>
              <button className={btn} onClick={() => setMode(recommended)}>
                Utiliser {MODES[recommended].label}
              </button>
              <button
                className={btn}
                onClick={() => {
                  setSuggestDismissed(true);
                  setMode(mode);
                }}
              >
                Garder {MODES[mode].label}
              </button>
              <WhyTip feature="router" />
            </>
          }
        >
          {upgradeReason(draft)}
        </Hint>
      )}

      {/* Feature 3 : mode choisi à la main plus puissant que nécessaire */}
      {!tool && showDowngrade && (
        <Hint
          icon={<Leaf size={16} strokeWidth={1.75} />}
          actions={
            <>
              <button className={btn} onClick={() => setMode('rapide')}>
                Utiliser Réponse rapide
              </button>
              <button className={btn} onClick={() => setSuggestDismissed(true)}>
                Garder {MODES[mode].label}
              </button>
              <WhyTip feature="router" />
            </>
          }
        >
          La réponse rapide donne une qualité équivalente pour cette question.
        </Hint>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="rounded-[28px] border border-line bg-surface shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-colors duration-200 focus-within:border-muted/50"
      >
        <label htmlFor="prompt" className="sr-only">
          Votre message
        </label>
        <textarea
          id="prompt"
          ref={ta}
          rows={1}
          autoFocus={autoFocus}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Posez votre question"
          className="block w-full resize-none bg-transparent px-5 pb-2 pt-4 text-[15px] text-ink placeholder:text-muted"
        />

        <div className="flex items-end gap-2 px-3 pb-3">
          {/* Feature 1 : sélecteur de mode, libellés orientés bénéfice */}
          <div role="radiogroup" aria-label="Mode de réponse" className="flex min-w-0 flex-1 flex-wrap gap-1">
            {MODE_ORDER.map((m) => {
              const on = mode === m;
              const Icon = MODE_ICONS[m];
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setMode(m)}
                  title={MODES[m].ideal}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-left transition-colors duration-200 ${
                    on ? (m === 'rapide' ? 'bg-mint text-accent-ink' : 'bg-surface-2 text-ink ring-1 ring-line') : 'text-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                  <span className="leading-tight">
                    <span className="block text-xs font-medium">{MODES[m].label}</span>
                    <span className="hidden text-[10.5px] opacity-80 sm:block">{MODES[m].sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={!draft.trim() || app.pending}
            aria-label="Envoyer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-25"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>
        </div>
      </form>

      {/* Ligne sous la saisie : pastille de routage + estimation */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2 text-xs">
        {showPill && (
          <span className="flex items-center gap-2">
            <Tip text="Ce mode donne une réponse de qualité équivalente pour cette question." align="left">
              <span tabIndex={0} className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 font-medium text-accent-ink">
                <Leaf size={12} strokeWidth={2} aria-hidden="true" />
                {routedFrom ? 'Routé vers Réponse rapide' : 'Réponse rapide'} · qualité équivalente
              </span>
            </Tip>
            <button
              className={link}
              onClick={() => {
                setSuggestDismissed(true); // choix explicite : on ne le remet pas en question
                setMode(routedFrom ?? 'approfondi');
              }}
            >
              Utiliser plutôt {MODES[routedFrom ?? 'approfondi'].label}
            </button>
          </span>
        )}

        {prefs.nudges.estimate && (
          <span className={`ml-auto flex items-center gap-2 rounded-full px-2.5 py-1 transition-colors duration-300 ${amber ? 'bg-amber-bg text-amber-ink' : 'text-muted'}`} aria-live="polite">
            <span>
              {formatWh(est.wh)} · {equivalent(est.wh)}
              {amber && (longThread ? ' · conversation longue, relue à chaque message' : ' · demande longue')}
            </span>
            <button className="underline underline-offset-2 hover:text-ink" onClick={() => app.setMethodOpen(true)}>
              estimation
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
