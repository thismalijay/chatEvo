import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bell, Eye, EyeOff } from 'lucide-react';
import type { ModeId } from '../../lib/types';
import { equivalentParts, fmt, formatWh, MODES, MODE_ORDER } from '../../lib/energy';
import { AVG_WH, FRIENDS, HEATMAP, HEATMAP_DAYS, HEATMAP_HOURS, TASKS, USAGE_30_DAYS } from '../../data/demoData';
import { useApp } from '../../state/store';
import { WaterTexture } from '../brand/WaterTexture';
import { Orb } from '../brand/Orb';
import { AnimatedNumber, Avatar, Card, CardTitle, ME, Toggle, WhyTip, btn } from '../ui';

/**
 * Feature 10 — MON USAGE (mode sombre « dashboard »).
 * Leviers : retour cumulé (une requête isolée paraît dérisoire), écart entre les soi (Higgins),
 * rapport qualité-prix visible. AUCUNE comparaison à la moyenne ; amis en opt-in, sans classement.
 */

export const MODE_COLORS: Record<ModeId, string> = { rapide: '#5BE0A3', equilibre: '#38BDF8', approfondi: '#E8DFC8' };
const AXIS = { fill: '#9AA5A0', fontSize: 11 };

function DarkTooltip({ active, payload, label, unit = 'Wh' }: { active?: boolean; payload?: { value: number; name: string; color?: string }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 text-muted">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-ink">
          {p.name} : {fmt(p.value, 1)} {unit}
        </p>
      ))}
    </div>
  );
}

const dayLabel = (iso: string, withDay = false) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', withDay ? { weekday: 'short', day: 'numeric' } : { day: 'numeric', month: 'short' });

export function UsagePage() {
  const app = useApp();
  const { prefs } = app;
  const [period, setPeriod] = useState<7 | 30>(30);

  // Données : historique fictif + requêtes réelles de la session ajoutées au dernier jour
  const rows = useMemo(() => {
    const base = USAGE_30_DAYS.map(([date, r, e, a]) => ({ date, rapide: r, equilibre: e, approfondi: a, wh: r * AVG_WH.rapide + e * AVG_WH.equilibre + a * AVG_WH.approfondi }));
    const last = base[base.length - 1];
    for (const l of app.live) {
      last[l.mode] += 1;
      last.wh += l.wh;
    }
    return base;
  }, [app.live]);

  const slice = rows.slice(-period);
  const series = slice.map((d) => ({ label: dayLabel(d.date, period === 7), wh: +d.wh.toFixed(1) }));
  const counts = { rapide: 0, equilibre: 0, approfondi: 0 } as Record<ModeId, number>;
  slice.forEach((d) => MODE_ORDER.forEach((m) => (counts[m] += d[m])));
  const totalReq = counts.rapide + counts.equilibre + counts.approfondi;
  const totalWh = slice.reduce((s, d) => s + d.wh, 0);
  const pct = (m: ModeId) => (totalReq ? Math.round((counts[m] / totalReq) * 100) : 0);
  const deepWhShare = totalWh ? Math.round(((counts.approfondi * AVG_WH.approfondi) / totalWh) * 100) : 0;
  const eq = equivalentParts(totalWh);
  const donut = MODE_ORDER.map((m) => ({ name: MODES[m].label, value: counts[m], id: m }));
  const week = rows.slice(-7);
  const lastWeekReq = week.reduce((s, d) => s + d.rapide + d.equilibre + d.approfondi, 0);
  const lastWeekRapide = week.reduce((s, d) => s + d.rapide, 0);
  const lastWeekWh = week.reduce((s, d) => s + d.wh, 0);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Mon usage</h1>
            <p className="mt-1 text-sm text-muted">Ordres de grandeur illustratifs · aucune comparaison avec d'autres utilisateurs</p>
          </div>
          <div className="flex items-center gap-3">
            <WhyTip feature="usage" align="right" />
            <div role="radiogroup" aria-label="Période" className="flex rounded-full border border-line bg-surface p-1">
              {([7, 30] as const).map((p) => (
                <button
                  key={p}
                  role="radio"
                  aria-checked={period === p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${period === p ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'}`}
                >
                  {p} jours
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* HERO glassmorphism sur texture signature (une seule par écran) */}
          <section className="reveal relative overflow-hidden rounded-3xl md:col-span-4 md:row-span-2" aria-label="Énergie cumulée">
            <WaterTexture seed={2} />
            <div className="absolute inset-0 bg-[rgba(8,20,15,0.35)]" />
            <div className="relative flex h-full min-h-[300px] flex-col justify-between p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm text-white/85">
                <Orb size={22} seed={3} /> Ces {period} derniers jours
              </div>
              <div className="glass rounded-2xl p-5 text-white sm:p-6">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-sm text-white/80">≈</span>
                  <AnimatedNumber value={eq.value} digits={eq.digits} className="text-6xl font-semibold tracking-tight" />
                  <span className="text-lg text-white/90">{eq.unit}</span>
                </p>
                <p className="mt-3 text-sm text-white/80">
                  ≈ {formatWh(totalWh)} pour {fmt(totalReq, 0)} requêtes · le mode Approfondi représente {pct('approfondi')} % des requêtes et environ {deepWhShare} % de l'énergie
                </p>
              </div>
            </div>
          </section>

          {/* Donut de répartition par mode */}
          <Card className="md:col-span-2 md:row-span-2" delay={80}>
            <CardTitle sub={`${fmt(totalReq, 0)} requêtes`}>Répartition par mode</CardTitle>
            <div className="relative mx-auto h-48 w-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={donut} dataKey="value" innerRadius={62} outerRadius={86} cornerRadius={10} paddingAngle={4} stroke="none" startAngle={90} endAngle={-270}>
                    {donut.map((d) => (
                      <Cell key={d.id} fill={MODE_COLORS[d.id]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip unit="requêtes" />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedNumber value={pct('rapide')} className="text-4xl font-semibold" />
                <span className="text-xs text-muted">% réponse rapide</span>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {MODE_ORDER.map((m) => (
                <li key={m} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: MODE_COLORS[m] }} />
                  <span className="text-muted">{MODES[m].label}</span>
                  <span className="ml-auto tabular-nums">{pct(m)} %</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Courbe de consommation */}
          <Card className="md:col-span-4" delay={140}>
            <CardTitle sub="Énergie estimée par jour (Wh)">Consommation sur {period} jours</CardTitle>
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={series} margin={{ left: -18, right: 6, top: 10 }}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#5BE0A3" stopOpacity={0.45} />
                      <stop offset="1" stopColor="#5BE0A3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="areaStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#5BE0A3" />
                      <stop offset="1" stopColor="#38BDF8" />
                    </linearGradient>
                    <filter id="glow" x="-10%" y="-30%" width="120%" height="160%">
                      <feGaussianBlur stdDeviation="4" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#232A27" />
                  <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval={period === 7 ? 0 : 6} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: '#232A27' }} />
                  <Area type="monotone" dataKey="wh" name="Énergie" stroke="url(#areaStroke)" strokeWidth={2.5} fill="url(#areaFill)" style={{ filter: 'url(#glow)' }} animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Écart entre les soi (optionnel) */}
          <Card className="md:col-span-2" delay={200}>
            <CardTitle>Ce qui compte pour vous</CardTitle>
            {prefs.nudges.selfGap && prefs.values.includes("l'environnement") ? (
              <p className="text-lg leading-snug">
                Vous avez indiqué tenir à l'environnement : <span className="font-semibold text-accent">{pct('rapide')} %</span> de vos requêtes ont utilisé la réponse rapide.
              </p>
            ) : (
              <p className="text-sm text-muted">Indiquez ce qui compte pour vous dans le didacticiel pour voir ici un rappel personnalisé (facultatif).</p>
            )}
          </Card>

          {/* Heatmap jours / heures */}
          <Card className="md:col-span-3" delay={240}>
            <CardTitle sub="Intensité moyenne par créneau">Quand vous utilisez l'IA</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1 text-[11px]">
                <caption className="sr-only">Usage par jour et par créneau horaire, de 0 (aucun) à 4 (intense)</caption>
                <thead>
                  <tr>
                    <th className="w-8" />
                    {HEATMAP_HOURS.map((h) => (
                      <th key={h} scope="col" className="font-normal text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HEATMAP.map((row, i) => (
                    <tr key={HEATMAP_DAYS[i]}>
                      <th scope="row" className="pr-1 text-left font-normal text-muted">
                        {HEATMAP_DAYS[i]}
                      </th>
                      {row.map((v, j) => (
                        <td key={j} className="p-0">
                          <div
                            title={`${HEATMAP_DAYS[i]} ${HEATMAP_HOURS[j]} : intensité ${v}/4`}
                            className="h-7 rounded-md transition-transform duration-200 hover:scale-110"
                            style={{ background: `rgba(91,224,163,${0.06 + v * 0.21})`, boxShadow: v >= 4 ? '0 0 12px rgba(91,224,163,.4)' : undefined }}
                          />
                          <span className="sr-only">{v}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Barres par type de tâche */}
          <Card className="md:col-span-3" delay={280}>
            <CardTitle sub="Requêtes sur 30 jours · survol : énergie">Par type de tâche</CardTitle>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={TASKS} margin={{ left: -18, right: 4, top: 8 }}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#5BE0A3" />
                      <stop offset="1" stopColor="#38BDF8" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#232A27" />
                  <XAxis dataKey="task" tick={AXIS} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={48} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs shadow-xl">
                          <p className="text-ink">{payload[0].payload.task}</p>
                          <p className="text-muted">
                            {payload[0].payload.requetes} requêtes · ≈ {payload[0].payload.wh} Wh
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="requetes" fill="url(#barFill)" radius={[10, 10, 4, 4]} barSize={28} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Aperçu du bilan hebdomadaire */}
          {prefs.nudges.weeklyReport && (
            <Card className="md:col-span-6" delay={320}>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-accent">
                  <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">Aperçu simulé · bilan envoyé chaque {prefs.reportDay}</p>
                  <p className="mt-0.5">
                    Cette semaine : {lastWeekReq} requêtes, dont {lastWeekReq ? Math.round((lastWeekRapide / lastWeekReq) * 100) : 0} % en réponse rapide. Au total,{' '}
                    {formatWh(lastWeekWh)}, soit environ {fmt(equivalentParts(lastWeekWh).value, 1)} {equivalentParts(lastWeekWh).unit}.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <FriendsSection />
        </div>
      </div>
    </div>
  );
}

/**
 * Comparaison entre amis — opt-in explicite, partage choisi, retrait à tout moment.
 * Présentation en PROFILS d'usage, jamais de classement ni de « qui consomme le plus ».
 */
function FriendsSection() {
  const app = useApp();
  const { prefs, updatePrefs } = app;
  const shown = FRIENDS.filter((f) => prefs.sharedFriendIds.includes(f.id));

  const myWeek = USAGE_30_DAYS.slice(-7).map(([, r, e, a]) => r * AVG_WH.rapide + e * AVG_WH.equilibre + a * AVG_WH.approfondi);
  const days = USAGE_30_DAYS.slice(-7).map(([d]) => dayLabel(d, true));
  const curves = days.map((label, i) => {
    const row: Record<string, number | string> = { label, Vous: +myWeek[i].toFixed(1) };
    shown.forEach((f) => (row[f.name] = f.week[i]));
    return row;
  });
  const colors = ['#38BDF8', '#E8DFC8', '#8FD3E0'];
  const myMix = { rapide: 66, equilibre: 25, approfondi: 9 };

  if (!prefs.friendsSharing) {
    return (
      <Card className="md:col-span-6" delay={360}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex -space-x-2">
            {FRIENDS.map((f) => (
              <Avatar key={f.id} initials={f.initials} gradient={f.gradient} />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-medium">Comparer avec des amis (facultatif)</h2>
            <p className="text-sm text-muted">Voir des profils d'usage côte à côte, sans classement. Vous choisissez qui voir et ce que vous partagez ; vous pouvez retirer le partage à tout moment.</p>
          </div>
          <button className={btn} onClick={() => updatePrefs({ friendsSharing: true })}>
            Activer la comparaison
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-6" delay={360}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CardTitle sub="Des profils, pas un classement : chacun a ses besoins.">Profils d'usage entre amis</CardTitle>
        <button className={btn} onClick={() => updatePrefs({ friendsSharing: false })}>
          <EyeOff size={15} strokeWidth={1.75} aria-hidden="true" /> Retirer mon partage
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <fieldset className="rounded-2xl border border-line p-4">
          <legend className="px-1 text-xs text-muted">Qui voir</legend>
          <ul className="space-y-2">
            {FRIENDS.map((f) => {
              const on = prefs.sharedFriendIds.includes(f.id);
              return (
                <li key={f.id}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => updatePrefs({ sharedFriendIds: on ? prefs.sharedFriendIds.filter((x) => x !== f.id) : [...prefs.sharedFriendIds, f.id] })}
                      className="h-4 w-4 accent-[#5BE0A3]"
                    />
                    <Avatar initials={f.initials} gradient={f.gradient} size={28} /> {f.name}
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted">Ce que je partage</p>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span id="share-modes">Répartition des modes</span>
              <Toggle checked={prefs.shareModes} onChange={(v) => updatePrefs({ shareModes: v })} labelledBy="share-modes" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span id="share-curve">Courbe d'usage</span>
              <Toggle checked={prefs.shareCurve} onChange={(v) => updatePrefs({ shareCurve: v })} labelledBy="share-curve" />
            </div>
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          {[{ id: 'me', name: ME.name, initials: ME.initials, gradient: ME.gradient, mix: myMix, profile: 'Vous utilisez surtout la réponse rapide et réservez Approfondi aux questions complexes.' }, ...shown].map((p) => (
            <div key={p.id} className="rounded-2xl border border-line bg-surface-2 p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={p.initials} gradient={p.gradient} />
                <p className="font-medium">{p.name}</p>
              </div>
              <p className="mt-2 text-sm text-muted">{p.profile}</p>
              {(p.id !== 'me' || prefs.shareModes) && (
                <div className="mt-3 flex h-2 overflow-hidden rounded-full" role="img" aria-label={MODE_ORDER.map((m) => `${MODES[m].label} ${p.mix[m]} %`).join(', ')}>
                  {MODE_ORDER.map((m) => (
                    <div key={m} style={{ width: `${p.mix[m]}%`, background: MODE_COLORS[m] }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {prefs.shareCurve && shown.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
            <Eye size={13} aria-hidden="true" /> Courbes superposées sur 7 jours (Wh)
          </p>
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={curves} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#232A27" />
                <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="Vous" stroke="#5BE0A3" strokeWidth={2.5} dot={false} />
                {shown.map((f, i) => (
                  <Line key={f.id} type="monotone" dataKey={f.name} stroke={colors[i % colors.length]} strokeWidth={1.75} dot={false} strokeDasharray="4 4" />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}
