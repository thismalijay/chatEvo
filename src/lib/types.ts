export type ModeId = 'rapide' | 'equilibre' | 'approfondi';
export type View = 'chat' | 'usage' | 'defis' | 'reglages';
export type ThemePref = 'clair' | 'sombre' | 'auto';
export type Complexity = 'simple' | 'moyen' | 'complexe';
export type TaskType = 'Question simple' | 'Rédaction' | 'Résumé' | 'Traduction' | 'Code' | 'Analyse';
export type Level = 'souple' | 'equilibre' | 'ambitieux' | 'tres';
export type Duration = '3 jours' | '1 semaine' | '1 mois';

export interface Impact {
  wh: number;
  inTokens: number; // message + historique relu
  historyTokens: number;
  outTokens: number; // texte visible
  reasoningTokens: number; // étapes de raisonnement (Approfondi)
}

export interface Msg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mode?: ModeId;
  impact?: Impact;
  expanded?: boolean;
  variant?: number;
  routedFrom?: ModeId;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: Msg[];
  summary?: string;
  newConvHintShown?: boolean; // la suggestion n'apparaît qu'une fois par conversation
}

export type NudgeKey = 'estimate' | 'router' | 'tools' | 'newConv' | 'regenNotice' | 'impactNote' | 'selfGap' | 'weeklyReport';

export interface Prefs {
  onboardedVersion: string | null;
  defaultMode: ModeId;
  shortAnswers: boolean;
  values: string[];
  nudges: Record<NudgeKey, boolean>;
  theme: ThemePref;
  regenNoticeSeen: boolean;
  reportDay: string;
  friendsSharing: boolean;
  sharedFriendIds: string[];
  shareModes: boolean;
  shareCurve: boolean;
  groupSharing: boolean;
}

export interface LiveReq {
  t: number;
  wh: number;
  mode: ModeId;
  task: TaskType;
}

export interface Friend {
  id: string;
  name: string;
  initials: string;
  gradient: [string, string];
  mix: Record<ModeId, number>; // % des requêtes
  profile: string;
  week: number[]; // Wh par jour, 7 derniers jours
}

export interface Challenge {
  id: string;
  title: string;
  members: string[]; // 'me' + ids d'amis
  duration: Duration;
  level: Level;
  thresholdWh: number;
  consumedWh: number;
  dayIndex: number;
  status: 'en cours' | 'en pause' | 'réussi' | 'pas cette fois' | 'quitté';
  reward: string;
  commitments: Record<string, string>;
  savingPct?: number;
  endedAt?: string;
}
