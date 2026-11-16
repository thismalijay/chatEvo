import { useId } from 'react';

/**
 * TEXTURE SIGNATURE « Eau & végétation vue du ciel » (élément de marque).
 * SVG génératif : dégradé de végétation + veines d'eau et bancs de sable, déformés par
 * feTurbulence + feDisplacementMap (basse fréquence = effet de courants), puis flou doux.
 * 3 variantes (seed). Dérive très lente (50 s), désactivée avec prefers-reduced-motion.
 * Pour utiliser une photo : remplacer le contenu par <img src="/assets/water-texture.jpg" className="object-cover" />.
 */

const VARIANTS = [
  { rot: 0, flip: 1, seed: 7 },
  { rot: 28, flip: -1, seed: 19 },
  { rot: -22, flip: 1, seed: 42 },
];

export function WaterTexture({ seed = 1, animated = true, className = '' }: { seed?: 1 | 2 | 3; animated?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  const v = VARIANTS[seed - 1];

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${animated ? 'texture-drift' : ''} ${className}`}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`veg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0F3D2A" />
          <stop offset="0.55" stopColor="#1E5C3C" />
          <stop offset="1" stopColor="#2F7D4F" />
        </linearGradient>
        <filter id={`flow${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.016" numOctaves={3} seed={v.seed} />
          <feDisplacementMap in="SourceGraphic" scale={70} xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation={2.2} />
        </filter>
        <filter id={`soft${id}`}>
          <feGaussianBlur stdDeviation={16} />
        </filter>
      </defs>

      <rect width="400" height="300" fill={`url(#veg${id})`} />

      <g transform={`rotate(${v.rot} 200 150) scale(${v.flip} 1) translate(${v.flip === -1 ? -400 : 0} 0)`}>
        {/* halos de végétation plus claire */}
        <g filter={`url(#soft${id})`} opacity={0.7}>
          <ellipse cx="90" cy="70" rx="90" ry="50" fill="#2F7D4F" />
          <ellipse cx="320" cy="230" rx="110" ry="60" fill="#2F7D4F" />
          <ellipse cx="250" cy="60" rx="60" ry="40" fill="#4FB3C8" opacity={0.5} />
        </g>
        {/* veines et nappes d'eau, déformées par les courants */}
        <g filter={`url(#flow${id})`}>
          <path d="M-40 260 C 60 200, 120 230, 180 160 S 300 60, 440 40" stroke="#4FB3C8" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M-40 260 C 60 200, 120 230, 180 160 S 300 60, 440 40" stroke="#8FD3E0" strokeWidth="7" fill="none" strokeLinecap="round" opacity={0.85} />
          <path d="M-20 120 C 80 140, 140 90, 220 110 S 330 190, 430 170" stroke="#4FB3C8" strokeWidth="11" fill="none" strokeLinecap="round" opacity={0.8} />
          <path d="M100 330 C 130 240, 210 250, 250 180 S 330 120, 360 -20" stroke="#8FD3E0" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.75} />
          <ellipse cx="185" cy="158" rx="34" ry="10" fill="#E8DFC8" opacity={0.6} transform="rotate(-32 185 158)" />
          <ellipse cx="90" cy="214" rx="22" ry="7" fill="#E8DFC8" opacity={0.5} transform="rotate(-25 90 214)" />
          <ellipse cx="300" cy="95" rx="26" ry="8" fill="#E8DFC8" opacity={0.5} transform="rotate(-38 300 95)" />
          <ellipse cx="240" cy="230" rx="40" ry="20" fill="#4FB3C8" opacity={0.55} />
        </g>
      </g>
    </svg>
  );
}
