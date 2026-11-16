import type { Complexity, ModeId, TaskType } from './types';
import { fmt } from './energy';

/**
 * ROUTEUR SIMULÉ (feature 3) et détection d'alternatives (feature 8).
 * Règles simples par expressions régulières : suffisant pour une maquette.
 */

const COMPLEX =
  /(?<!\p{L})(analys|compar|démontr|explique en détail|argument|dissertation|évalu|critiqu|synthétis|débogu|optimis|stratégi|plan détaillé|avantages et inconvénients)/iu;
const CODE = /```|=>|\b(function|const|def|class|import|return|SELECT|console\.log)\b|\b(code|script|programme|bug|algorithme)\b/i;
const MEDIUM = /(?<!\p{L})(rédige|écris|résume|résumé|traduis|traduction|explique|lettre|mail|courriel|article|paragraphe|slogan|propose|idées?)(?!\p{L})/iu;

export function classify(text: string): Complexity {
  const s = text.trim();
  if (!s) return 'simple';
  if (s.length > 400 || COMPLEX.test(s) || CODE.test(s)) return 'complexe';
  if (s.length > 160 || MEDIUM.test(s)) return 'moyen';
  return 'simple';
}

export const RECOMMENDED: Record<Complexity, ModeId> = { simple: 'rapide', moyen: 'equilibre', complexe: 'approfondi' };

/** Phrase expliquant POURQUOI un mode plus puissant est suggéré. */
export function upgradeReason(text: string): string {
  if (CODE.test(text)) return 'Pour du code, le mode Approfondi vérifie son raisonnement étape par étape.';
  if (COMPLEX.test(text)) return 'Cette demande compare et analyse plusieurs éléments : le mode Approfondi raisonne en plusieurs étapes et donnera une réponse plus complète.';
  if (text.trim().length > 400) return 'Cette demande est longue et détaillée : un mode plus complet en tiendra mieux compte.';
  return 'Pour rédiger ou résumer, le mode Équilibré donne souvent un texte plus abouti.';
}

export function taskType(text: string): TaskType {
  if (CODE.test(text)) return 'Code';
  if (COMPLEX.test(text)) return 'Analyse';
  if (/résum/i.test(text)) return 'Résumé';
  if (/tradu/i.test(text)) return 'Traduction';
  if (MEDIUM.test(text)) return 'Rédaction';
  return 'Question simple';
}

/* ------------------------------------------------------------------ */
/* Alternatives « avant l'IA »                                         */
/* ------------------------------------------------------------------ */

export interface ToolHint {
  kind: 'calc' | 'convert' | 'spell' | 'define';
  message: string;
  action: string;
  result?: string;
  url?: string;
}

const CONVERT =
  /\d+([.,]\d+)?\s*(g|kg|mg|l|ml|cl|dl|cm|mm|m|km|miles?|pieds?|pouces?|oz|onces?|lb|livres?|°\s?[cf]|degrés?|€|euros?|dollars?|\$)\s.*\b(en|vers)\b|\bconverti[rs]?\b/i;
const SPELL = /(orthographe|s['’]écri(t|vent)|comment (on )?écri(t|re)|accord de)/i;
const DEFINE = /^(que (veut dire|signifie)|qu['’]est-ce que (veut dire|signifie)|définition|définis|c['’]est quoi (un|une|le|la|l['’])\s*[\p{L}-]+\s*\??$)/iu;

function safeCalc(expr: string): string | null {
  const e = expr.replace(/[×x]/gi, '*').replace(/÷/g, '/').replace(/,/g, '.').replace(/%/g, '/100');
  if (!/^[\d+\-*/().\s]+$/.test(e)) return null;
  try {
    // Expression strictement arithmétique (vérifiée ci-dessus) : aucun appel de fonction possible.
    const v = Function(`"use strict"; return (${e});`)() as number;
    return Number.isFinite(v) ? fmt(v, 4) : null;
  } catch {
    return null;
  }
}

export function detectTool(text: string): ToolHint | null {
  const s = text.trim();
  if (s.length < 3 || s.length > 120) return null;
  const expr = s.replace(/^(combien (font|fait)|calcule[rz]?|calcul)\s*:?\s*/i, '').replace(/\s*[?=]\s*$/, '');
  if (/^[\d\s+\-*/×x÷.,()%]+$/i.test(expr) && /\d\s*[+\-*/×x÷]\s*\d/i.test(expr)) {
    const result = safeCalc(expr);
    if (result !== null) return { kind: 'calc', message: 'Une calculatrice suffirait ici.', action: 'Utiliser la calculatrice', result };
  }
  const search = `https://duckduckgo.com/?q=${encodeURIComponent(s)}`;
  if (CONVERT.test(s)) return { kind: 'convert', message: 'Un convertisseur ou un moteur de recherche suffirait ici.', action: 'Utiliser un moteur de recherche', url: search };
  if (SPELL.test(s)) return { kind: 'spell', message: 'Un correcteur ou un dictionnaire suffirait ici.', action: 'Ouvrir un dictionnaire', url: search };
  if (DEFINE.test(s)) return { kind: 'define', message: 'Un dictionnaire suffirait ici.', action: 'Ouvrir un dictionnaire', url: search };
  return null;
}

/* ------------------------------------------------------------------ */
/* Changement de sujet (feature 5) : mots-clés communs                 */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  'avec pour dans cette comme mais plus tout tous faire peux peut quoi quel quelle quels quelles entre sans sont etre avoir donne merci aussi alors encore autre votre notre leurs celle celui rapide rapidement propose explique fait est-ce comment pourquoi quand parce exemple bonjour'.split(' '),
);

export function keywords(text: string): Set<string> {
  const words = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z]{5,}/g) ?? [];
  return new Set(words.filter((w) => !STOP.has(w)));
}

export function isTopicShift(previousTexts: string[], draft: string): boolean {
  if (previousTexts.length < 4 || draft.trim().length < 12) return false;
  const prev = new Set(previousTexts.flatMap((t) => [...keywords(t)]));
  const cur = [...keywords(draft)];
  return cur.length >= 2 && !cur.some((w) => prev.has(w));
}
