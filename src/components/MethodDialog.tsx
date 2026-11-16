import { MODES, MODE_ORDER } from '../lib/energy';
import { useApp } from '../state/store';
import { Dialog } from './ui';

/** « Comment c'est estimé ? » : transparence sur le modèle d'estimation (ordres de grandeur illustratifs). */
export function MethodDialog() {
  const { setMethodOpen } = useApp();
  return (
    <Dialog title="Comment c'est estimé ?" onClose={() => setMethodOpen(false)}>
      <div className="space-y-4 text-sm leading-relaxed text-muted">
        <p>
          Les chiffres sont des <strong className="text-ink">ordres de grandeur illustratifs</strong>, pas des mesures. Ils servent à
          rendre visibles les écarts entre usages.
        </p>
        <p className="rounded-2xl bg-surface-2 p-3 font-mono text-xs text-ink">Énergie (Wh) = a × tokens d'entrée + b × tokens générés</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Les tokens d'entrée incluent tout l'historique de la conversation, relu à chaque message.</li>
          <li>Le mode Approfondi génère des étapes de raisonnement invisibles (environ 20 fois plus de tokens).</li>
          <li>1 token ≈ 4 caractères.</li>
        </ul>
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Ordres de grandeur par mode</caption>
          <thead>
            <tr className="text-muted">
              <th className="py-1 font-medium">Mode</th>
              <th className="py-1 font-medium">Modèle</th>
              <th className="py-1 font-medium">Requête typique</th>
            </tr>
          </thead>
          <tbody className="text-ink">
            {MODE_ORDER.map((m) => (
              <tr key={m} className="border-t border-line">
                <td className="py-1.5">{MODES[m].label}</td>
                <td>{MODES[m].model}</td>
                <td>{m === 'approfondi' ? '≈ 5 à 30 Wh' : `≈ ${MODES[m].typicalWh.toLocaleString('fr-FR')} Wh`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h3 className="font-medium text-ink">Équivalences</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Micro-ondes (≈ 1 kW) : 0,2 Wh ≈ 0,7 seconde</li>
            <li>Ampoule LED de 10 W : 1 Wh ≈ 6 minutes</li>
          </ul>
        </div>
        <p className="text-xs">Sources : Oviedo et al. (2025) ; Luccioni et al. (2024) ; Ruf &amp; Detyniecki (2025).</p>
      </div>
    </Dialog>
  );
}
