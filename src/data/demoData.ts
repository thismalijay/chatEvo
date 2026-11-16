/**
 * DONNÉES DE DÉMO — fictives mais réalistes, à modifier librement pour la soutenance.
 * Tout ce qui s'affiche dans « Mon usage » et « Défis » vient de ce fichier.
 */
import type { Challenge, Friend, Level } from '../lib/types';

/**
 * 30 jours d'usage : [date, requêtes Réponse rapide, Équilibré, Approfondi].
 * Pics en semaine, creux le week-end (et le 11 novembre, férié).
 * Répartition obtenue : ≈ 66 % rapide / 25 % équilibré / 9 % approfondi.
 */
export const USAGE_30_DAYS: [string, number, number, number][] = [
  ['2026-10-18', 5, 2, 0],
  ['2026-10-19', 16, 6, 2],
  ['2026-10-20', 18, 7, 3],
  ['2026-10-21', 15, 6, 2],
  ['2026-10-22', 17, 7, 3],
  ['2026-10-23', 14, 5, 2],
  ['2026-10-24', 6, 2, 1],
  ['2026-10-25', 4, 2, 0],
  ['2026-10-26', 17, 7, 2],
  ['2026-10-27', 19, 7, 3],
  ['2026-10-28', 16, 6, 3],
  ['2026-10-29', 18, 8, 2],
  ['2026-10-30', 13, 5, 2],
  ['2026-10-31', 5, 2, 0],
  ['2026-11-01', 4, 1, 1],
  ['2026-11-02', 16, 6, 2],
  ['2026-11-03', 17, 7, 3],
  ['2026-11-04', 15, 6, 2],
  ['2026-11-05', 18, 7, 2],
  ['2026-11-06', 14, 6, 2],
  ['2026-11-07', 6, 2, 1],
  ['2026-11-08', 5, 2, 0],
  ['2026-11-09', 17, 6, 2],
  ['2026-11-10', 18, 7, 2],
  ['2026-11-11', 12, 4, 1],
  ['2026-11-12', 17, 7, 3],
  ['2026-11-13', 15, 6, 2],
  ['2026-11-14', 6, 2, 1],
  ['2026-11-15', 4, 2, 0],
  ['2026-11-16', 9, 3, 1],
];

/** Énergie moyenne retenue par requête pour l'historique (Wh). */
export const AVG_WH = { rapide: 0.2, equilibre: 0.3, approfondi: 6.5 };

/** Heatmap : lignes = jours (lun → dim), colonnes = créneaux horaires, valeurs 0 à 4. */
export const HEATMAP_HOURS = ['8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
export const HEATMAP_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const HEATMAP: number[][] = [
  [1, 3, 2, 3, 4, 2, 1, 0],
  [1, 4, 2, 3, 3, 2, 1, 1],
  [1, 3, 1, 2, 3, 2, 2, 0],
  [2, 4, 2, 3, 4, 3, 1, 1],
  [1, 3, 2, 2, 2, 1, 1, 0],
  [0, 1, 1, 1, 0, 1, 2, 1],
  [0, 0, 1, 1, 1, 0, 1, 1],
];

/** Usage par type de tâche sur 30 jours. */
export const TASKS = [
  { task: 'Question simple', requetes: 248, wh: 52 },
  { task: 'Rédaction', requetes: 121, wh: 61 },
  { task: 'Résumé', requetes: 74, wh: 33 },
  { task: 'Traduction', requetes: 39, wh: 12 },
  { task: 'Code', requetes: 52, wh: 148 },
  { task: 'Analyse', requetes: 38, wh: 138 },
];

/** Amis (comparaison opt-in, sans classement). week = Wh par jour sur 7 jours. */
export const FRIENDS: Friend[] = [
  {
    id: 'lea',
    name: 'Léa',
    initials: 'LM',
    gradient: ['#5BE0A3', '#38BDF8'],
    mix: { rapide: 78, equilibre: 17, approfondi: 5 },
    profile: 'Léa utilise surtout la réponse rapide et développe quand elle en a besoin.',
    week: [9, 12, 11, 10, 8, 3, 2],
  },
  {
    id: 'tom',
    name: 'Tom',
    initials: 'TB',
    gradient: ['#8FD3E0', '#2F7D4F'],
    mix: { rapide: 52, equilibre: 28, approfondi: 20 },
    profile: 'Tom alterne selon ses besoins : rapide au quotidien, Approfondi pour le code.',
    week: [18, 22, 15, 20, 17, 6, 4],
  },
  {
    id: 'ines',
    name: 'Inès',
    initials: 'IK',
    gradient: ['#E8DFC8', '#4FB3C8'],
    mix: { rapide: 64, equilibre: 30, approfondi: 6 },
    profile: 'Inès privilégie le mode Équilibré pour rédiger.',
    week: [12, 10, 13, 11, 9, 5, 3],
  },
];

/** Niveaux d'ambition : seuil collectif = Wh par personne et par jour × membres × jours. */
export const LEVELS: Record<Level, { label: string; perDay: number; hint: string }> = {
  souple: { label: 'Souple', perDay: 16, hint: 'Proche de votre usage habituel' },
  equilibre: { label: 'Équilibré', perDay: 13, hint: 'Le bon mode au bon moment' },
  ambitieux: { label: 'Ambitieux', perDay: 10, hint: 'Approfondi réservé aux vraies questions complexes' },
  tres: { label: 'Très ambitieux', perDay: 8, hint: 'Pour une période calme' },
};

export const DURATION_DAYS = { '3 jours': 3, '1 semaine': 7, '1 mois': 30 } as const;
export const REWARD = '+30 min de mode Approfondi chacun';

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Notre semaine bien dosée',
    members: ['me', 'lea'],
    duration: '1 semaine',
    level: 'equilibre',
    thresholdWh: 182,
    consumedWh: 96,
    dayIndex: 4,
    status: 'en cours',
    reward: REWARD,
    commitments: {
      me: 'Je garde Approfondi pour mes vraies questions complexes.',
      lea: 'Je commence par la réponse rapide et je développe si besoin.',
    },
  },
  {
    id: 'p1',
    title: 'Trois jours sereins',
    members: ['me', 'tom'],
    duration: '3 jours',
    level: 'ambitieux',
    thresholdWh: 60,
    consumedWh: 47,
    dayIndex: 3,
    status: 'réussi',
    savingPct: 38,
    reward: REWARD,
    commitments: { me: 'Une conversation par sujet.', tom: 'Je relis ma question avant de régénérer.' },
    endedAt: '2026-11-08',
  },
  {
    id: 'p2',
    title: 'Mois de révisions',
    members: ['me', 'lea', 'ines'],
    duration: '1 mois',
    level: 'tres',
    thresholdWh: 720,
    consumedWh: 765,
    dayIndex: 30,
    status: 'pas cette fois',
    reward: REWARD,
    commitments: { me: 'Réponses courtes par défaut.' },
    endedAt: '2026-10-31',
  },
  {
    id: 'p3',
    title: 'Semaine de rendu',
    members: ['me', 'ines'],
    duration: '1 semaine',
    level: 'souple',
    thresholdWh: 224,
    consumedWh: 171,
    dayIndex: 7,
    status: 'réussi',
    savingPct: 24,
    reward: REWARD,
    commitments: { me: 'Je vérifie d’abord si une recherche suffit.' },
    endedAt: '2026-10-25',
  },
];

/** Fils de conversation pré-remplis (scénarios 4 et 5). */
export const THREAD_TOPIC: [string, string][] = [
  [
    "Je prépare un exposé de 10 minutes sur la sobriété numérique. Tu peux m'aider à construire un plan ?",
    'Un plan en trois parties : 1) le constat, un impact matériel souvent invisible ; 2) les leviers, garder ses appareils et proportionner ses usages ; 3) les limites, la sobriété individuelle ne suffit pas sans conception responsable des services.',
  ],
  [
    'Développe la première partie sur les impacts environnementaux.',
    "Le numérique repose sur les terminaux, les réseaux et les centres de données. En France, l'ADEME et l'Arcep montrent que la fabrication des terminaux concentre la majeure partie de l'empreinte. L'usage pèse aussi, mais loin de l'utilisateur : on ne perçoit pas ce que l'on consomme.",
  ],
  [
    'Quels chiffres clés je peux citer sans me tromper ?',
    "Restez sur des ordres de grandeur sourcés : le numérique représente quelques pourcents des émissions mondiales ; en France, la fabrication des équipements domine l'empreinte du numérique. Citez toujours la source et l'année.",
  ],
  [
    'Et pour la partie sur les leviers individuels ?',
    "Trois leviers : garder ses appareils plus longtemps, adapter ses usages (qualité vidéo, contenus en arrière-plan), et pour l'IA générative, choisir le mode adapté à la question et ouvrir une nouvelle conversation quand on change de sujet.",
  ],
  [
    "Comment rendre l'introduction plus accrocheuse ?",
    "Partez d'une situation vécue : « Ce matin, qui a posé une question à une IA avant d'ouvrir un moteur de recherche ? » Le geste paraît anodin ; il mobilise pourtant des serveurs à des centaines de kilomètres.",
  ],
];

export const THREAD_SLOGAN: [string, string][] = [
  ["Écris un slogan pour l'association de quartier « Les Jardins partagés ».", '« Ici, on sème ensemble. »'],
];
