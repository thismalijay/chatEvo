import { useEffect, useRef } from 'react';
import { Leaf, MessageSquarePlus } from 'lucide-react';
import { gaugeFill, AMBER_THRESHOLD, conversationTokens, fmt } from '../../lib/energy';
import { isTopicShift } from '../../lib/router';
import { useApp } from '../../state/store';
import { WaterTexture } from '../brand/WaterTexture';
import { Orb } from '../brand/Orb';
import { Composer } from './Composer';
import { AssistantMessage } from './Message';
import { Tip, WhyTip, btn } from '../ui';
import { APP_NAME } from '../../config';

const EXAMPLES = ["Quelle est la capitale de l'Australie ?", 'Reformule cette phrase plus simplement', '12,5 × 4', 'Résume les idées clés du TAM'];

/**
 * Feature 13 — ÉCRAN D'ACCUEIL : saisie centrale, réponse rapide présélectionnée,
 * exemples courts, aucune injonction écologique. Bandeau à la texture signature.
 */
function Home() {
  const app = useApp();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col justify-center px-4 py-8">
        <div className="reveal relative h-32 overflow-hidden rounded-3xl sm:h-36">
          <WaterTexture seed={1} />
          <div className="absolute inset-0 bg-[rgba(8,20,15,0.35)]" />
          <div className="relative flex h-full items-end justify-between gap-4 p-5">
            <div>
              <p className="text-xl font-semibold tracking-tight text-white">{APP_NAME}</p>
              <p className="text-sm text-white/85">L'IA, à la bonne dose.</p>
            </div>
            <Orb size={48} seed={2} />
          </div>
        </div>

        <h1 className="reveal mt-10 text-center text-3xl font-semibold tracking-tight" style={{ animationDelay: '80ms' }}>
          Que voulez-vous savoir ?
        </h1>
        <div className="reveal mt-6" style={{ animationDelay: '140ms' }}>
          <Composer autoFocus />
        </div>
        <div className="reveal mt-5 flex flex-wrap justify-center gap-2" style={{ animationDelay: '200ms' }}>
          {EXAMPLES.map((e) => (
            <button key={e} onClick={() => app.setDraft(e)} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition-colors duration-200 hover:bg-surface hover:text-ink">
              {e}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <WhyTip feature="accueil" />
        </div>
      </div>
    </div>
  );
}

/** Feature 5 — jauge fine de longueur de conversation (coût caché de l'historique rendu saillant). */
function Gauge() {
  const { active } = useApp();
  if (!active || (active.messages.length === 0 && !active.summary)) return null;
  const fill = gaugeFill(active);
  const amber = fill >= AMBER_THRESHOLD;
  return (
    <div className="shrink-0">
      <div className="h-[3px] w-full bg-line/60" role="meter" aria-label="Longueur de la conversation" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(fill * 100)}>
        <div className={`h-full transition-all duration-500 ${amber ? 'bg-amber-ink/70' : 'bg-accent'}`} style={{ width: `${fill * 100}%` }} />
      </div>
      <div className="mx-auto flex max-w-[720px] items-center gap-2 px-4 pt-1.5 text-[11px] text-muted">
        <Tip text="Toute la conversation est relue par le modèle à chaque message : plus elle est longue, plus chaque message coûte." align="left">
          <span tabIndex={0}>
            {active.messages.length} messages · ≈ {fmt(conversationTokens(active), 0)} tokens relus à chaque message
          </span>
        </Tip>
      </div>
    </div>
  );
}

export function ChatScreen() {
  const app = useApp();
  const { active, prefs, draft } = app;
  const scrollRef = useRef<HTMLDivElement>(null);
  const n = active?.messages.length ?? 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [active?.id, n, app.pending, active?.messages[n - 1]?.text]);

  if (!active) return <Home />;

  // Suggestion UNIQUE et non bloquante : sujet nouveau ou conversation longue
  const topicShift = isTopicShift(active.messages.map((m) => m.text), draft);
  const long = gaugeFill(active) >= 1;
  const showNewConv = prefs.nudges.newConv && !active.newConvHintShown && n > 0 && (topicShift || long);
  const lastAssistant = active.messages[n - 1]?.role === 'assistant' ? active.messages[n - 1].id : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Gauge />
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[720px] space-y-7 px-4 py-6">
          {active.summary && (
            <section aria-label="Contexte repris" className="reveal rounded-2xl border border-line bg-surface p-4">
              <h2 className="flex items-center gap-1.5 text-xs font-medium text-accent-ink">
                <Leaf size={13} strokeWidth={2} aria-hidden="true" /> Contexte repris de la conversation précédente
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{active.summary}</p>
            </section>
          )}
          {active.messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={m.id} className="reveal flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl bg-surface-2 px-4 py-2.5 text-[15px] text-ink">{m.text}</div>
              </div>
            ) : (
              <AssistantMessage key={m.id} msg={m} prev={active.messages[i - 1]} isLast={m.id === lastAssistant} />
            ),
          )}
          {app.pending && (
            <p className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
              <Orb size={18} /> <span className="animate-pulse">Réponse en cours…</span>
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[720px] px-4 pb-4">
        {showNewConv && (
          <div role="status" className="reveal mb-2 rounded-2xl border border-line bg-surface px-4 py-3 text-sm shadow-sm">
            <p className="flex items-start gap-2">
              <MessageSquarePlus size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />
              {topicShift ? 'Ce sujet est nouveau : une nouvelle conversation serait plus légère.' : 'Cette conversation devient longue : une nouvelle conversation serait plus légère.'}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-6">
              <button className={btn} onClick={() => app.newConversation({ keepDraft: true })}>
                Nouvelle conversation
              </button>
              <button className={btn} onClick={() => app.newConversation({ withSummary: true, keepDraft: true })}>
                Nouvelle conversation avec résumé
              </button>
              <button className={btn} onClick={app.dismissNewConvHint}>
                Continuer ici
              </button>
              <WhyTip feature="newConv" />
            </div>
          </div>
        )}
        <Composer />
      </div>
    </div>
  );
}
