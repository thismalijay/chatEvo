import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { featureById } from '../lib/features';

/* Classes partagées. Accepter et refuser utilisent la MÊME classe `btn` (même poids visuel). */
export const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-2';
export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2 text-sm font-medium text-bg transition-opacity duration-200 hover:opacity-85';
export const btnAccent =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-ink px-5 py-2 text-sm font-medium text-on-accent transition-opacity duration-200 hover:opacity-90';
export const link = 'text-xs text-muted underline underline-offset-2 hover:text-ink';

/** Carte de la grille bento (apparition échelonnée). */
export function Card({ children, className = '', delay = 0, as: Tag = 'section' }: { children: ReactNode; className?: string; delay?: number; as?: 'section' | 'div' }) {
  return (
    <Tag className={`reveal rounded-3xl border border-line bg-surface p-5 sm:p-6 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

export function CardTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-medium text-ink">{children}</h2>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

/** Info-bulle au survol et au focus clavier. */
export function Tip({ text, children, align = 'center' }: { text: string; children: ReactNode; align?: 'center' | 'left' | 'right' }) {
  const pos = align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'left' ? 'left-0' : 'right-0';
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-50 mb-2 w-64 rounded-xl bg-ink px-3 py-2 text-xs font-normal leading-relaxed text-bg opacity-0 shadow-lg transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 ${pos}`}
      >
        {text}
      </span>
    </span>
  );
}

/** « Pourquoi ? » : explique le levier d'une fonctionnalité (transparence). */
export function WhyTip({ feature, align = 'center' }: { feature: string; align?: 'center' | 'left' | 'right' }) {
  const f = featureById(feature);
  const text = `${f.why} (${f.lever})`;
  return (
    <Tip text={text} align={align}>
      <button type="button" aria-label={`Pourquoi ? ${text}`} className="inline-flex items-center gap-1 rounded-full text-xs text-muted hover:text-ink">
        <Info size={13} strokeWidth={1.75} aria-hidden="true" /> Pourquoi ?
      </button>
    </Tip>
  );
}

export function Toggle({ checked, onChange, label, labelledBy }: { checked: boolean; onChange: (v: boolean) => void; label?: string; labelledBy?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-accent-ink' : 'bg-line'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

/** Avatar d'ami : cercle à dégradé doux avec initiales. Jamais de numéro ni de rang. */
export function Avatar({ initials, gradient, size = 36 }: { initials: string; gradient: [string, string]; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-[#0C0F0E] ring-2 ring-bg"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
export const ME = { name: 'Vous', initials: 'MO', gradient: ['#5BE0A3', '#2F7D4F'] as [string, string] };

/** Compteur animé (désactivé avec prefers-reduced-motion). */
export function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      setV(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function AnimatedNumber({ value, digits = 0, className = '', style }: { value: number; digits?: number; className?: string; style?: CSSProperties }) {
  const v = useCountUp(value);
  return (
    <span className={className} style={style}>
      {v.toLocaleString('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits })}
    </span>
  );
}

/** Mini-jauge circulaire à dégradé menthe → turquoise. */
export function Ring({ value, size = 120, stroke = 12, children, label }: { value: number; size?: number; stroke?: number; children?: ReactNode; label: string }) {
  const gid = useId().replace(/:/g, '');
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(Math.min(value, 1)), 60);
    return () => clearTimeout(t);
  }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5BE0A3" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#ring${gid})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          style={{ transition: 'stroke-dashoffset 1000ms cubic-bezier(.2,.7,.2,1)', filter: 'drop-shadow(0 0 6px rgba(91,224,163,.45))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/** Fenêtre modale accessible (Échap pour fermer). Utilisée seulement à la demande de l'utilisateur. */
export function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const tid = useId();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tid}
        className={`reveal max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-line bg-surface p-6 text-ink shadow-2xl ${wide ? 'max-w-xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={tid} className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <button autoFocus onClick={onClose} className={btn} aria-label="Fermer">
            Fermer
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
