import { useState } from 'react';
import { Gift, LogOut, Pause, Play, Plus, RotateCcw, Share2 } from 'lucide-react';
import type { Challenge, Duration, Level } from '../../lib/types';
import { fmt } from '../../lib/energy';
import { DURATION_DAYS, FRIENDS, LEVELS, REWARD } from '../../data/demoData';
import { useApp } from '../../state/store';
import { uid } from '../../lib/storage';
import { WaterTexture } from '../brand/WaterTexture';
import { Orb } from '../brand/Orb';
import { Avatar, Card, CardTitle, Dialog, ME, Ring, WhyTip, btn, btnAccent } from '../ui';
import { APP_NAME } from '../../config';

/**
 * Feature 11 — DÉFIS COOPÉRATIFS (mode sombre).
 * Leviers : engagement, normes sociales descriptives, fixation d'objectifs, incitation positive.
 * On gagne ENSEMBLE sous un seuil collectif ; jauge collective uniquement ; récompense = temps d'usage utile.
 * Interdits respectés : pas de classement, pas de score individuel, pas de série de victoires, pas de badge.
 */

const person = (id: string) => (id === 'me' ? ME : FRIENDS.find((f) => f.id === id)!);
const names = (ids: string[]) => ids.map((id) => person(id).name).join(' et ');

function Members({ ids, size = 32 }: { ids: string[]; size?: number }) {
  return (
    <div className="flex -space-x-2">
      {ids.map((id) => {
        const p = person(id);
        return <Avatar key={id} initials={p.initials} gradient={p.gradient} size={size} />;
      })}
    </div>
  );
}

/** Carte de victoire partageable : texture en haut, bandeau vert dégradé, gros chiffre collectif. */
function ShareCard({ c, onClose }: { c: Challenge; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `Défi « ${c.title} » réussi ensemble : −${c.savingPct} % (${names(c.members)}) · ${APP_NAME}`;
  return (
    <Dialog title="Carte de partage" onClose={onClose}>
      <div className="overflow-hidden rounded-3xl border border-line">
        <div className="relative h-44">
          <WaterTexture seed={3} />
          <div className="absolute inset-0 bg-[rgba(8,20,15,0.25)]" />
          <div className="absolute right-4 top-4">
            <Orb size={44} seed={1} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1E5C3C] via-[#2F7D4F] to-[#2E8F6F] p-6 text-white">
          <p className="text-sm text-white/85">Défi réussi ensemble</p>
          <p className="mt-1 text-xl font-semibold">{c.title}</p>
          <p className="mt-4 text-6xl font-semibold tracking-tight">−{c.savingPct} %</p>
          <p className="text-sm text-white/90">ensemble · {names(c.members)}</p>
          <p className="mt-6 text-sm font-semibold tracking-wide">{APP_NAME}</p>
        </div>
      </div>
      <button
        className={`${btnAccent} mt-4`}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false));
        }}
      >
        <Share2 size={15} aria-hidden="true" /> {copied ? 'Texte copié' : 'Copier le texte à partager'}
      </button>
    </Dialog>
  );
}

function CreateChallenge({ onDone }: { onDone: () => void }) {
  const app = useApp();
  const [friends, setFriends] = useState<string[]>(['lea']);
  const [duration, setDuration] = useState<Duration>('1 semaine');
  const [level, setLevel] = useState<Level>('equilibre');
  const [title, setTitle] = useState('Notre défi bien dosé');
  const [commitment, setCommitment] = useState('Je garde Approfondi pour mes vraies questions complexes.');
  const members = ['me', ...friends];
  const days = DURATION_DAYS[duration];
  const threshold = (l: Level) => LEVELS[l].perDay * members.length * days;
  const deepPerDay = Math.max(0, Math.floor((LEVELS[level].perDay - 3) / 6.5));

  const create = () => {
    app.createChallenge({
      id: uid(),
      title: title.trim() || 'Défi coopératif',
      members,
      duration,
      level,
      thresholdWh: threshold(level),
      consumedWh: 0,
      dayIndex: 0,
      status: 'en cours',
      reward: REWARD,
      commitments: Object.fromEntries(members.map((m) => [m, m === 'me' ? commitment : ''])),
    });
    onDone();
  };

  return (
    <Card className="md:col-span-6">
      <CardTitle sub="On gagne ensemble si le total reste sous le seuil choisi.">Créer un défi</CardTitle>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="ch-title" className="text-xs text-muted">
              Nom du défi
            </label>
            <input id="ch-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm focus:border-muted focus:outline-none" />
          </div>
          <fieldset>
            <legend className="text-xs text-muted">Avec qui</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {FRIENDS.map((f) => {
                const on = friends.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFriends((xs) => (on ? xs.filter((x) => x !== f.id) : [...xs, f.id]))}
                    className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors ${on ? 'border-accent bg-mint' : 'border-line text-muted hover:text-ink'}`}
                  >
                    <Avatar initials={f.initials} gradient={f.gradient} size={26} /> {f.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs text-muted">Durée</legend>
            <div className="mt-2 flex gap-2">
              {(Object.keys(DURATION_DAYS) as Duration[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={duration === d}
                  onClick={() => setDuration(d)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${duration === d ? 'border-accent bg-mint text-ink' : 'border-line text-muted hover:text-ink'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="ch-commit" className="text-xs text-muted">
              Mon engagement (visible du groupe)
            </label>
            <textarea id="ch-commit" value={commitment} onChange={(e) => setCommitment(e.target.value)} rows={2} className="mt-1 w-full resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm focus:border-muted focus:outline-none" />
          </div>
        </div>

        <fieldset>
          <legend className="text-xs text-muted">Niveau d'ambition (seuil collectif)</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(Object.keys(LEVELS) as Level[]).map((l) => {
              const on = level === l;
              return (
                <label key={l} className={`cursor-pointer rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-accent ${on ? 'border-accent bg-mint' : 'border-line hover:bg-surface-2'}`}>
                  <input type="radio" name="level" className="sr-only" checked={on} onChange={() => setLevel(l)} />
                  <span className="block font-medium">{LEVELS[l].label}</span>
                  <span className="mt-1 block text-2xl font-semibold tabular-nums">{fmt(threshold(l), 0)} Wh</span>
                  <span className="block text-xs text-muted">{LEVELS[l].hint}</span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Défi à qualité constante : ce seuil laisse la place à environ {deepPerDay > 0 ? `${deepPerDay} question${deepPerDay > 1 ? 's' : ''}` : 'quelques questions'} en mode Approfondi par jour et par personne.
            L'objectif est le bon mode au bon moment, pas de renoncer à un usage utile.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Gift size={13} aria-hidden="true" /> Si le seuil est respecté : {REWARD}.
          </p>
        </fieldset>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className={btnAccent} onClick={create} disabled={friends.length === 0}>
          Lancer le défi
        </button>
        <button className={btn} onClick={onDone}>
          Annuler
        </button>
      </div>
    </Card>
  );
}

export function ChallengesPage() {
  const app = useApp();
  const [creating, setCreating] = useState(false);
  const [share, setShare] = useState<Challenge | null>(null);
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);

  const current = app.challenges.filter((c) => c.status === 'en cours' || c.status === 'en pause');
  const past = app.challenges.filter((c) => c.status === 'réussi' || c.status === 'pas cette fois');
  const hero = current[0];
  const others = current.slice(1);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Défis</h1>
            <p className="mt-1 text-sm text-muted">Coopératifs : on gagne ensemble, sans classement.</p>
          </div>
          <div className="flex items-center gap-3">
            <WhyTip feature="defis" align="right" />
            {!creating && (
              <button className={btnAccent} onClick={() => setCreating(true)}>
                <Plus size={16} aria-hidden="true" /> Créer un défi
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-6">
          {creating && <CreateChallenge onDone={() => setCreating(false)} />}

          {/* HERO : défi en cours, jauge COLLECTIVE */}
          {hero ? (
            <section className="reveal relative overflow-hidden rounded-3xl md:col-span-6" aria-label="Défi en cours">
              <WaterTexture seed={1} />
              <div className="absolute inset-0 bg-[rgba(8,20,15,0.35)]" />
              <div className="glass relative m-3 grid gap-6 rounded-2xl p-5 text-white sm:m-5 sm:p-7 md:grid-cols-[auto_1fr]">
                <Ring value={hero.consumedWh / hero.thresholdWh} size={168} stroke={14} label={`Consommation collective : ${hero.consumedWh} Wh sur ${hero.thresholdWh} Wh`}>
                  <span className="text-4xl font-semibold tabular-nums">{Math.round((hero.consumedWh / hero.thresholdWh) * 100)} %</span>
                  <span className="text-xs text-white/80">du seuil collectif</span>
                </Ring>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-white/75">{hero.status === 'en pause' ? 'En pause' : 'En cours'} · {hero.duration} · {LEVELS[hero.level].label}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">{hero.title}</h2>
                  <div className="mt-3 flex items-center gap-3">
                    <Members ids={hero.members} />
                    <span className="text-sm text-white/90">{names(hero.members)}</span>
                  </div>
                  <p className="mt-4 text-sm text-white/90">
                    Ensemble : {fmt(hero.consumedWh, 0)} Wh sur {fmt(hero.thresholdWh, 0)} Wh · jour {hero.dayIndex} sur {DURATION_DAYS[hero.duration]}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                    <Gift size={14} aria-hidden="true" /> À la clé : {hero.reward}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {hero.members.map((m) => (
                      <li key={m} className="text-white/90">
                        <span className="font-medium text-white">{person(m).name} :</span> {hero.commitments[m] || 'engagement à venir'}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
                      onClick={() => app.updateChallenge(hero.id, { status: hero.status === 'en pause' ? 'en cours' : 'en pause' })}
                    >
                      {hero.status === 'en pause' ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
                      {hero.status === 'en pause' ? 'Reprendre' : 'Mettre en pause'}
                    </button>
                    {confirmLeave === hero.id ? (
                      <>
                        <button className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-sm text-white hover:bg-white/20" onClick={() => app.updateChallenge(hero.id, { status: 'quitté' })}>
                          Confirmer : quitter
                        </button>
                        <button className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-sm text-white hover:bg-white/20" onClick={() => setConfirmLeave(null)}>
                          Rester
                        </button>
                      </>
                    ) : (
                      <button className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-white/20" onClick={() => setConfirmLeave(hero.id)}>
                        <LogOut size={14} aria-hidden="true" /> Quitter le défi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            !creating && (
              <Card className="md:col-span-6">
                <p className="text-muted">Aucun défi en cours. Créez-en un avec un ou plusieurs amis.</p>
              </Card>
            )
          )}

          {others.map((c, i) => (
            <Card key={c.id} className="md:col-span-3" delay={80 + i * 60}>
              <div className="flex items-center gap-4">
                <Ring value={c.consumedWh / c.thresholdWh} size={72} stroke={8} label={`${c.consumedWh} Wh sur ${c.thresholdWh} Wh`}>
                  <span className="text-sm font-semibold">{Math.round((c.consumedWh / c.thresholdWh) * 100)} %</span>
                </Ring>
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted">
                    {c.status} · {names(c.members)}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {/* Défis passés : historique simple, message neutre en cas d'échec */}
          <div className="md:col-span-6">
            <h2 className="mb-3 mt-4 text-sm font-medium text-muted">Défis passés</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {past.map((c, i) => {
                const ok = c.status === 'réussi';
                return (
                  <Card key={c.id} delay={120 + i * 70} as="div">
                    <div className="flex items-start gap-4">
                      <Ring value={Math.min(1, c.consumedWh / c.thresholdWh)} size={64} stroke={7} label={`${c.consumedWh} Wh sur ${c.thresholdWh} Wh`}>
                        <span className="text-xs font-semibold">{ok ? `−${c.savingPct} %` : `${Math.round((c.consumedWh / c.thresholdWh) * 100)} %`}</span>
                      </Ring>
                      <div className="min-w-0">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-muted">
                          {c.duration} · {names(c.members)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm">{ok ? `Réussi ensemble ! Récompense : ${c.reward}.` : 'Pas cette fois, on réessaie ?'}</p>
                    <div className="mt-3">
                      {ok ? (
                        <button className={btn} onClick={() => setShare(c)}>
                          <Share2 size={14} aria-hidden="true" /> Carte de partage
                        </button>
                      ) : (
                        <button className={btn} onClick={() => setCreating(true)}>
                          <RotateCcw size={14} aria-hidden="true" /> Relancer un défi
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {share && <ShareCard c={share} onClose={() => setShare(null)} />}
    </div>
  );
}
