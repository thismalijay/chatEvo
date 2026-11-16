import { useState } from 'react';
import { ChevronDown, ChevronsDown, Leaf, RefreshCw } from 'lucide-react';
import type { Msg } from '../../lib/types';
import { equivalent, fmt, formatWh, historyShare, MODES } from '../../lib/energy';
import { useApp } from '../../state/store';
import { WhyTip, btn, btnPrimary, link } from '../ui';

/**
 * Feature 4 — NOTE D'IMPACT : saillance, équivalents parlants, retour d'information.
 * Une ligne discrète ; le détail (modèle, tokens, part de l'historique) se déplie au clic.
 */
function ImpactNote({ msg }: { msg: Msg }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  if (!msg.impact || !msg.mode || !app.prefs.nudges.impactNote) return null;
  const i = msg.impact;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full py-0.5 text-xs text-muted transition-colors hover:text-ink"
      >
        <Leaf size={12} strokeWidth={2} className="text-accent-ink" aria-hidden="true" />
        {formatWh(i.wh)} · {equivalent(i.wh)}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="reveal mt-2 max-w-md rounded-2xl border border-line bg-surface-2 p-3.5 text-xs text-ink">
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5">
            <dt className="text-muted">Modèle utilisé</dt>
            <dd>
              {MODES[msg.mode].model} ({MODES[msg.mode].label})
            </dd>
            {msg.routedFrom && (
              <>
                <dt className="text-muted">Routage</dt>
                <dd>Depuis {MODES[msg.routedFrom].label} · qualité équivalente</dd>
              </>
            )}
            <dt className="text-muted">Tokens d'entrée</dt>
            <dd>
              {fmt(i.inTokens, 0)} (dont {fmt(i.historyTokens, 0)} d'historique)
            </dd>
            <dt className="text-muted">Tokens générés</dt>
            <dd>
              {fmt(i.outTokens, 0)}
              {i.reasoningTokens > 0 && ` + ${fmt(i.reasoningTokens, 0)} de raisonnement`}
            </dd>
            <dt className="text-muted">Part due à l'historique</dt>
            <dd>{Math.round(historyShare(i, msg.mode) * 100)} %</dd>
          </dl>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-2.5">
            <span className="text-muted">Ordre de grandeur illustratif</span>
            <button className={link} onClick={() => app.setMethodOpen(true)}>
              Comment c'est estimé ?
            </button>
            <WhyTip feature="impactNote" align="right" />
          </div>
        </div>
      )}
    </div>
  );
}

const REFINE_CHIPS = ['Public visé : ', 'Format souhaité : ', 'Ton : ', 'Longueur : ', 'Exemple de ce que j’attends : '];

/**
 * Feature 7 — RÉGÉNÉRATION RESPONSABLE : contre la récompense variable (« machine à sous »).
 * Information unique au premier clic, aide à la reformulation, désactivable.
 */
function RefineBox({ initial, onClose }: { initial: string; onClose: () => void }) {
  const app = useApp();
  const [text, setText] = useState(initial);
  return (
    <div className="reveal mt-3 rounded-2xl border border-line bg-surface p-4">
      <label htmlFor="refine" className="text-sm font-medium">
        Préciser ma demande
      </label>
      <p className="mt-0.5 text-xs text-muted">Ajoutez ce qui manquait : le résultat sera plus proche de ce que vous attendez.</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {REFINE_CHIPS.map((c) => (
          <button key={c} type="button" className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:bg-surface-2 hover:text-ink" onClick={() => setText((t) => `${t.trimEnd()}\n${c}`)}>
            + {c.replace(' : ', '')}
          </button>
        ))}
      </div>
      <textarea
        id="refine"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="mt-2 w-full resize-y rounded-xl border border-line bg-bg p-3 text-sm focus:border-muted focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          className={btnPrimary}
          onClick={() => {
            app.send(text, { replaceLastPair: true });
            onClose();
          }}
        >
          Envoyer la demande précisée
        </button>
        <button className={btn} onClick={onClose}>
          Annuler
        </button>
      </div>
    </div>
  );
}

export function AssistantMessage({ msg, prev, isLast }: { msg: Msg; prev?: Msg; isLast: boolean }) {
  const app = useApp();
  const [notice, setNotice] = useState(false);
  const [refine, setRefine] = useState(false);

  const onRegenerate = () => {
    if (app.prefs.nudges.regenNotice && !app.prefs.regenNoticeSeen) {
      setNotice(true);
      app.updatePrefs({ regenNoticeSeen: true }); // n'apparaît qu'une fois
      return;
    }
    app.regenerate();
  };

  return (
    <article aria-label="Réponse" className="reveal">
      <div className="whitespace-pre-wrap text-[15px] leading-7 text-ink">{msg.text}</div>
      <ImpactNote msg={msg} />

      {!app.pending && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {/* Feature 6 : réponse courte par défaut, détail en 1 clic */}
          {!msg.expanded && msg.mode !== 'approfondi' && (
            <button className={btn} onClick={() => app.expand(msg.id)}>
              <ChevronsDown size={15} strokeWidth={1.75} aria-hidden="true" /> Développer
            </button>
          )}
          {isLast && (
            <button onClick={onRegenerate} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-muted transition-colors hover:text-ink">
              <RefreshCw size={13} strokeWidth={1.75} aria-hidden="true" /> Régénérer
            </button>
          )}
        </div>
      )}

      {notice && !refine && (
        <div role="status" className="reveal mt-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
          <p>Régénérer relance un calcul complet. Préciser votre demande donne souvent un meilleur résultat.</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              className={btn}
              onClick={() => {
                setRefine(true);
                setNotice(false);
              }}
            >
              Préciser ma demande
            </button>
            <button
              className={btn}
              onClick={() => {
                setNotice(false);
                app.regenerate();
              }}
            >
              Régénérer quand même
            </button>
            <button
              className={link}
              onClick={() => {
                app.setNudge('regenNotice', false);
                setNotice(false);
              }}
            >
              Ne plus afficher
            </button>
            <WhyTip feature="regenNotice" />
          </div>
        </div>
      )}
      {refine && prev && <RefineBox initial={prev.text} onClose={() => setRefine(false)} />}
    </article>
  );
}
