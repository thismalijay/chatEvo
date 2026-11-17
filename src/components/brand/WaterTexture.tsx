/**
 * TEXTURE SIGNATURE « Eau & lumière » (élément de marque).
 * Photo : reflets du soleil dans une eau peu profonde (public/assets/water-texture.jpg).
 * 3 variantes (seed) = cadrage et orientation différents de la même image.
 * Dérive très lente (50 s), désactivée avec prefers-reduced-motion.
 */

const SRC = `${import.meta.env.BASE_URL}assets/water-texture.jpg`;

const VARIANTS = [
  { position: '30% 40%', transform: 'scale(1.15)' },
  { position: '70% 60%', transform: 'scale(1.2) scaleX(-1)' },
  { position: '50% 30%', transform: 'scale(1.2) rotate(180deg)' },
];

export function WaterTexture({ seed = 1, animated = true, className = '' }: { seed?: 1 | 2 | 3; animated?: boolean; className?: string }) {
  const v = VARIANTS[seed - 1];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0" style={{ transform: v.transform }}>
        <img
          src={SRC}
          alt=""
          draggable={false}
          className={`h-full w-full object-cover ${animated ? 'texture-drift' : ''}`}
          style={{ objectPosition: v.position }}
        />
      </div>
    </div>
  );
}
