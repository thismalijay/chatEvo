import { WaterTexture } from './WaterTexture';

/** Orbe de marque : sphère portant la texture signature, rotation très lente (60 s). Fait office de logo. */
export function Orb({ size = 28, seed = 1 }: { size?: number; seed?: 1 | 2 | 3 }) {
  return (
    <span className="relative inline-block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }} aria-hidden="true">
      <span className="orb-spin absolute -inset-1/4">
        <WaterTexture seed={seed} animated={false} />
      </span>
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 26%, rgba(255,255,255,.6), rgba(255,255,255,0) 42%), radial-gradient(circle at 72% 82%, rgba(0,0,0,.35), rgba(0,0,0,0) 60%)',
        }}
      />
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/30" />
    </span>
  );
}
