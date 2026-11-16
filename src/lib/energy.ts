import type { Conversation, Impact, ModeId } from './types';

/**
 * MODÈLE D'ESTIMATION — ordres de grandeur ILLUSTRATIFS, signalés comme tels dans l'interface.
 *
 *   Énergie (Wh) = a × tokens_entrée + b × tokens_générés
 *
 * - tokens_entrée = message + TOUT l'historique, relu à chaque message (Ruf & Detyniecki, 2025) :
 *   le coût d'un message augmente avec la longueur de la conversation.
 * - tokens_générés = réponse visible × facteur de raisonnement (modèles « reasoning »).
 * - Calibrage (requête typique : ~300 tokens d'entrée, ~400 tokens de sortie) :
 *     Réponse rapide (modèle léger)        ≈ 0,2 Wh
 *     Équilibré (modèle standard)          ≈ 0,3 Wh
 *     Approfondi (modèle de raisonnement)  ≈ 5 à 30 Wh selon la longueur
 *   Ordres de grandeur cohérents avec Oviedo et al. (2025) et Luccioni et al. (2024).
 */

export const CHARS_PER_TOKEN = 4;

export const MODES: Record<
  ModeId,
  { label: string; sub: string; ideal: string; model: string; a: number; b: number; reasoningFactor: number; typicalWh: number }
> = {
  rapide: {
    label: 'Réponse rapide',
    sub: 'Question factuelle, reformulation',
    ideal: 'Idéal pour une question factuelle, une reformulation',
    model: 'Modèle léger',
    a: 0.00005,
    b: 0.00045,
    reasoningFactor: 1,
    typicalWh: 0.2,
  },
  equilibre: {
    label: 'Équilibré',
    sub: 'Rédiger, résumer, expliquer',
    ideal: 'Idéal pour rédiger, résumer, expliquer',
    model: 'Modèle standard',
    a: 0.00007,
    b: 0.0007,
    reasoningFactor: 1,
    typicalWh: 0.3,
  },
  approfondi: {
    label: 'Approfondi',
    sub: 'Analyser, comparer, coder',
    ideal: 'Idéal pour analyser, comparer, coder',
    model: 'Modèle de raisonnement',
    a: 0.0002,
    b: 0.0007,
    reasoningFactor: 20,
    typicalWh: 6.5,
  },
};
export const MODE_ORDER: ModeId[] = ['rapide', 'equilibre', 'approfondi'];
export const modeRank = (m: ModeId) => MODE_ORDER.indexOf(m);

/** Longueur attendue de la réponse (estimation AVANT envoi). */
export const EXPECTED_OUT = { court: 150, long: 450 };

/** Jauge de conversation : pleine à 12 messages ou 4 000 tokens d'historique. */
export const GAUGE_MAX_MESSAGES = 12;
export const GAUGE_MAX_TOKENS = 4000;
export const AMBER_THRESHOLD = 0.75;
export const LONG_PROMPT_CHARS = 1200;

/** Équivalences. */
export const MICROWAVE_WH_PER_S = 1000 / 3600; // micro-ondes ≈ 1 kW : 0,2 Wh ≈ 0,7 s
export const LED_W = 10; // ampoule LED 10 W : 1 Wh ≈ 6 min
export const LED_DAY_WH = LED_W * 24; // une journée d'ampoule allumée en continu

export const estimateTokens = (text: string) => (text.trim() ? Math.ceil(text.length / CHARS_PER_TOKEN) : 0);

export function computeImpact(mode: ModeId, historyTokens: number, promptTokens: number, outputTokens: number): Impact {
  const { a, b, reasoningFactor } = MODES[mode];
  const inTokens = historyTokens + promptTokens;
  const reasoningTokens = outputTokens * (reasoningFactor - 1);
  return { wh: a * inTokens + b * (outputTokens + reasoningTokens), inTokens, historyTokens, outTokens: outputTokens, reasoningTokens };
}

export const addImpacts = (x: Impact, y: Impact): Impact => ({
  wh: x.wh + y.wh,
  inTokens: x.inTokens + y.inTokens,
  historyTokens: x.historyTokens + y.historyTokens,
  outTokens: x.outTokens + y.outTokens,
  reasoningTokens: x.reasoningTokens + y.reasoningTokens,
});

export const historyShare = (i: Impact, mode: ModeId) => (i.wh > 0 ? (MODES[mode].a * i.historyTokens) / i.wh : 0);

export function conversationTokens(conv: Pick<Conversation, 'messages' | 'summary'> | null | undefined): number {
  if (!conv) return 0;
  return estimateTokens(conv.summary ?? '') + conv.messages.reduce((s, m) => s + estimateTokens(m.text), 0);
}

export function gaugeFill(conv: Conversation | null): number {
  if (!conv) return 0;
  return Math.min(1, Math.max(conv.messages.length / GAUGE_MAX_MESSAGES, conversationTokens(conv) / GAUGE_MAX_TOKENS));
}

export const fmt = (n: number, digits = 1) => n.toLocaleString('fr-FR', { maximumFractionDigits: digits });
export const formatWh = (wh: number) => `${fmt(wh, wh < 1 ? 2 : wh < 10 ? 1 : 0)} Wh`;

/** Choisit l'équivalent le plus lisible. */
export function equivalentParts(wh: number): { value: number; unit: string; digits: number } {
  if (wh < 1) {
    const s = wh / MICROWAVE_WH_PER_S;
    return { value: s, unit: 's de micro-ondes', digits: s < 10 ? 1 : 0 };
  }
  const minutes = (wh / LED_W) * 60;
  if (minutes < 90) return { value: minutes, unit: "min d'ampoule LED", digits: 0 };
  const hours = minutes / 60;
  if (hours < 24) return { value: hours, unit: "h d'ampoule LED", digits: 1 };
  const days = wh / LED_DAY_WH;
  return { value: days, unit: `jour${days >= 2 ? 's' : ''} d'ampoule LED allumée en continu`, digits: 1 };
}

export function equivalent(wh: number): string {
  if (wh <= 0) return '0 Wh';
  const p = equivalentParts(wh);
  return `≈ ${fmt(p.value, p.digits)} ${p.unit}`;
}
