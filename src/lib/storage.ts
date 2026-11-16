import type { Prefs } from './types';

export const KEYS = {
  prefs: 'chatevo:prefs',
  convs: 'chatevo:convs',
  challenges: 'chatevo:challenges',
  live: 'chatevo:live',
} as const;

export const defaultPrefs: Prefs = {
  onboardedVersion: null,
  defaultMode: 'rapide',
  shortAnswers: true,
  values: [],
  nudges: { estimate: true, router: true, tools: true, newConv: true, regenNotice: true, impactNote: true, selfGap: true, weeklyReport: true },
  theme: 'clair',
  regenNoticeSeen: false,
  reportDay: 'lundi',
  friendsSharing: false,
  sharedFriendIds: ['lea', 'tom'],
  shareModes: true,
  shareCurve: true,
  groupSharing: true,
};

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) return Array.isArray(parsed) ? (parsed as T) : fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : la maquette continue sans persistance */
  }
}

export function clearAll(): void {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignoré */
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
