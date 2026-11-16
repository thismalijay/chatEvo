import type { NudgeKey } from './types';

/**
 * Les 13 fonctionnalités, leur levier comportemental et leur bénéfice pour l'utilisateur.
 * Utilisé par : Réglages (« Pourquoi ces choix ? »), info-bulles « Pourquoi ? » et démo guidée.
 */
export interface Feature {
  n: number;
  id: string;
  title: string;
  lever: string;
  why: string;
  show: string; // consigne affichée dans la démo guidée
}

export const FEATURES: Feature[] = [
  {
    n: 1,
    id: 'mode',
    title: "Sélecteur de mode à côté du bouton d'envoi",
    lever: "Timely (EAST) · conditions facilitantes · effet de cadrage",
    why: "Le choix du modèle se fait au moment où vous écrivez, en un clic. Chaque libellé décrit ce que le mode fait bien, jamais ce qu'il « retire ».",
    show: 'La question est pré-remplie. Repérez les trois modes dans la zone de saisie et leur usage idéal.',
  },
  {
    n: 2,
    id: 'estimate',
    title: 'Estimation avant envoi',
    lever: 'Saillance (MINDSPACE) · Timely · heuristique de disponibilité corrigée',
    why: "Le coût d'une requête est invisible. Un équivalent concret, affiché avant l'envoi, aide à choisir en connaissance de cause. L'indicateur passe à l'ambre doux quand la conversation devient longue.",
    show: "Sous la saisie : l'estimation change selon le mode choisi. Dans ce long fil, elle passe à l'ambre doux.",
  },
  {
    n: 3,
    id: 'router',
    title: 'Suggestion intelligente de mode',
    lever: "Défaut + Easy (EAST) · évite l'aversion à la perte",
    why: "Pour une question simple, la réponse rapide donne une qualité équivalente : elle est choisie pour vous, comme un itinéraire économe, et vous revenez en arrière en un clic. Pour une demande complexe, Approfondi vous est proposé, avec la raison.",
    show: 'Demande complexe : le routeur propose Approfondi et explique pourquoi. Rien ne change sans votre clic.',
  },
  {
    n: 4,
    id: 'impactNote',
    title: "Note d'impact sous chaque réponse",
    lever: "Saillance · équivalents parlants · retour d'information",
    why: "Une ligne discrète traduit l'énergie estimée en équivalent du quotidien. Le détail (modèle, tokens, part de l'historique) est à un clic.",
    show: "Sous la réponse : cliquez sur la note d'impact pour déplier le détail.",
  },
  {
    n: 5,
    id: 'newConv',
    title: 'Compteur de conversation et nouvelle conversation',
    lever: "Saillance du coût caché de l'historique · Timely · Easy",
    why: "Toute la conversation est relue à chaque message. La jauge rend ce coût visible ; quand le sujet change, une nouvelle conversation (avec résumé si besoin) allège chaque message sans rien perdre.",
    show: 'Jauge en haut du fil. Le nouveau message change de sujet : une suggestion unique, non bloquante, apparaît.',
  },
  {
    n: 6,
    id: 'short',
    title: 'Réponses courtes par défaut et « Développer »',
    lever: 'Défaut (Ebeling & Lotz) · Easy · proportionnalité',
    why: 'Une réponse concise suffit souvent ; le détail reste à un clic. Les réponses se terminent sans relance automatique.',
    show: 'Réponse courte par défaut. Cliquez sur « Développer » pour obtenir le détail.',
  },
  {
    n: 7,
    id: 'regenNotice',
    title: 'Régénération responsable',
    lever: 'Récompense variable (effet « machine à sous ») · Timely',
    why: "Régénérer relance un calcul complet, souvent au hasard. Préciser sa demande donne plus souvent le bon résultat. L'information n'apparaît qu'une fois.",
    show: 'Cliquez sur « Régénérer » : une information unique propose de préciser la demande.',
  },
  {
    n: 8,
    id: 'tools',
    title: "Alternatives « avant l'IA »",
    lever: 'Proportionnalité « Avant » · habitude, mémoire procédurale',
    why: "Pour un calcul, une conversion ou une définition, un outil simple répond aussi bien, sans modèle de langage. La suggestion ne s'affiche jamais deux fois d'affilée.",
    show: 'Conversion d’unités : la suggestion propose un outil simple, avec « Demander quand même ».',
  },
  {
    n: 9,
    id: 'onboarding',
    title: 'Didacticiel de premier usage',
    lever: 'Moment de transition (habit discontinuity) · engagement · statu quo',
    why: 'Le premier usage est le meilleur moment pour installer une habitude. Vous choisissez vos réglages par défaut, en lien avec ce qui compte pour vous.',
    show: 'Trois écrans, passables à tout moment. Il réapparaît lors d’un changement de version.',
  },
  {
    n: 10,
    id: 'usage',
    title: 'Page « Mon usage »',
    lever: 'Retour cumulé · écart entre les soi · rapport qualité-prix visible',
    why: 'Une requête isolée paraît dérisoire ; le cumul donne une image juste. Aucune comparaison avec la moyenne des autres utilisateurs ; la comparaison entre amis est facultative et sans classement.',
    show: 'Tableau de bord sombre : équivalent cumulé, courbe, répartition, heatmap, tâches, amis (sur accord).',
  },
  {
    n: 11,
    id: 'defis',
    title: 'Défis coopératifs entre amis',
    lever: "Engagement · normes sociales descriptives · fixation d'objectifs · incitation positive",
    why: "On gagne ensemble si le total reste sous le seuil choisi. Pas de classement ni de score individuel ; la récompense est du temps d'usage utile.",
    show: 'Jauge collective du défi en cours, création d’un défi, défis passés et carte de partage.',
  },
  {
    n: 12,
    id: 'reglages',
    title: 'Réglages',
    lever: 'Transparence · autonomie · réversibilité',
    why: 'Chaque suggestion se désactive, chaque défaut se change, et vous contrôlez ce que vous partagez.',
    show: 'Chaque suggestion est désactivable ; la rubrique « Pourquoi ces choix ? » explique tout.',
  },
  {
    n: 13,
    id: 'accueil',
    title: "Écran d'accueil",
    lever: "Défaut · Easy · absence d'injonction",
    why: 'La réponse rapide est présélectionnée et des exemples courts montrent les usages adaptés, sans message moralisateur.',
    show: 'Saisie centrale, réponse rapide présélectionnée, exemples courts.',
  },
];

export const featureById = (id: string) => FEATURES.find((f) => f.id === id)!;

export const NUDGE_LABELS: Record<NudgeKey, { label: string; hint: string }> = {
  estimate: { label: 'Estimation avant envoi', hint: 'Équivalent concret sous la zone de saisie' },
  router: { label: 'Suggestion intelligente de mode', hint: 'Routage vers la réponse rapide quand la qualité est équivalente' },
  tools: { label: "Alternatives « avant l'IA »", hint: 'Calculatrice, convertisseur, dictionnaire' },
  newConv: { label: 'Suggestion de nouvelle conversation', hint: 'Quand le fil est long ou que le sujet change' },
  regenNotice: { label: 'Information sur la régénération', hint: 'Affichée une seule fois' },
  impactNote: { label: "Note d'impact sous les réponses", hint: 'Une ligne discrète, dépliable' },
  selfGap: { label: 'Phrase sur mes valeurs dans « Mon usage »', hint: 'Rappelle ce qui compte pour vous' },
  weeklyReport: { label: 'Bilan hebdomadaire', hint: 'Envoyé le même jour chaque semaine' },
};
