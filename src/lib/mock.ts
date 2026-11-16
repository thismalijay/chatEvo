import type { Conversation, ModeId } from './types';

/**
 * RÉPONSES SIMULÉES (pas d'API). Chaque script a une version courte (par défaut, feature 6),
 * une version développée (« Développer ») et parfois une version Approfondi.
 * Aucune réponse ne se termine par une relance du type « Voulez-vous que je… ? ».
 */

interface Script {
  test: RegExp;
  short: string[]; // variantes (régénération)
  long: string;
  deep?: string;
}

const SCRIPTS: Script[] = [
  {
    test: /capitale.*australie/i,
    short: [
      "La capitale de l'Australie est Canberra, et non Sydney ou Melbourne.",
      "C'est Canberra : la ville a été créée pour départager Sydney et Melbourne.",
    ],
    long: "La capitale de l'Australie est Canberra.\n\nOn pense souvent à Sydney ou à Melbourne, les deux plus grandes villes du pays, mais Canberra a été choisie comme compromis entre ces deux rivales et construite spécialement pour accueillir les institutions fédérales. Son plan a été dessiné par Walter Burley Griffin et Marion Mahony Griffin, lauréats d'un concours international en 1912. Le Parlement y siège depuis 1927.",
  },
  {
    test: /(utaut.*tam|tam.*utaut)/i,
    short: [
      "Le TAM explique l'adoption par l'utilité et la facilité d'utilisation perçues ; l'UTAUT élargit à quatre déterminants (performance attendue, effort attendu, influence sociale, conditions facilitantes) avec des modérateurs. Limite commune : ils prédisent l'intention déclarée plus que l'usage réel.",
      "TAM : deux facteurs, simples mais généraux. UTAUT : quatre déterminants et quatre modérateurs, plus complet mais lourd à répliquer. Tous deux décrivent mal les habitudes.",
    ],
    long: "Le TAM (Davis, 1989) explique l'intention d'utiliser une technologie par deux croyances : l'utilité perçue et la facilité d'utilisation perçue. L'UTAUT (Venkatesh et al., 2003) synthétise huit modèles autour de quatre déterminants : performance attendue, effort attendu, influence sociale et conditions facilitantes, modulés par l'âge, le genre, l'expérience et le caractère volontaire de l'usage.\n\nLimites communes : ils mesurent surtout l'intention déclarée, alors que l'usage réel dépend beaucoup des habitudes ; ils ont été pensés pour le contexte professionnel. L'UTAUT2 ajoute la motivation hédonique, le prix et l'habitude.",
    deep: "Voici une comparaison structurée.\n\n1. Ce que proposent les deux modèles\nLe TAM (Davis, 1989) explique l'intention d'utiliser une technologie par deux croyances : l'utilité perçue et la facilité d'utilisation perçue. L'UTAUT (Venkatesh et al., 2003) synthétise huit modèles antérieurs, dont le TAM, autour de quatre déterminants : performance attendue, effort attendu, influence sociale et conditions facilitantes.\n\n2. Ce qui les distingue\n• Portée : le TAM est volontairement parcimonieux ; l'UTAUT intègre la dimension sociale et matérielle de l'usage.\n• Modérateurs : dans l'UTAUT, l'effet de chaque facteur varie selon l'âge, le genre, l'expérience et le caractère volontaire de l'usage.\n• Pouvoir explicatif : dans l'étude d'origine, l'UTAUT explique une part plus importante de la variance de l'intention.\n\n3. Limites communes\n• Ils mesurent des intentions déclarées, alors que l'usage réel dépend des habitudes.\n• Ils décrivent mal l'usage grand public, ludique ou automatique.\n• Ils ne disent rien des conséquences de l'usage, comme son impact environnemental.\n\n4. Limites propres\n• TAM : « utilité » et « facilité » restent trop générales pour guider une intervention.\n• UTAUT : nombreuses variables, réplication difficile ; l'UTAUT2 (2012) ajoute habitude, prix et motivation hédonique.\n\nEn résumé, le TAM offre une base simple et robuste, l'UTAUT une grille plus complète ; tous deux gagnent à être complétés par des approches centrées sur les habitudes et le contexte de choix.",
  },
  {
    test: /250\s*g.*tasse/i,
    short: [
      "Cela dépend de l'ingrédient : environ 2 tasses de farine, 1 ¼ tasse de sucre, ou un peu plus d'une tasse d'eau.",
      "Une tasse mesure environ 240 ml : 250 g d'eau ≈ 1 tasse, 250 g de farine ≈ 2 tasses.",
    ],
    long: "Une tasse mesure un volume (environ 240 ml), pas une masse. Pour 250 g :\n\n• farine : ≈ 2 tasses\n• sucre en poudre : ≈ 1 ¼ tasse\n• beurre : ≈ 1 tasse + 2 cuillères à soupe\n• eau ou lait : ≈ 1 tasse",
  },
  {
    test: /lentille/i,
    short: [
      "Un dahl express : lentilles corail, lait de coco, oignon, ail, curry, 20 minutes à feu doux.",
      "Une salade tiède de lentilles vertes, échalote, moutarde et herbes fraîches.",
    ],
    long: "Dahl de lentilles corail (20 min, 2 personnes) :\n\n1. Faites revenir un oignon, une gousse d'ail et un peu de gingembre.\n2. Ajoutez 200 g de lentilles corail rincées, 400 ml de lait de coco, 300 ml d'eau et une cuillère de curry.\n3. Laissez mijoter 20 minutes en remuant, salez, et servez avec du riz ou du pain.",
  },
  {
    test: /slogan/i,
    short: ['« Ici, on sème ensemble. »', '« Un quartier qui pousse, ensemble. »', '« Cultivons le voisinage. »', '« Des graines et des voisins. »'],
    long: "Trois pistes, selon le ton recherché :\n\n• Chaleureux : « Ici, on sème ensemble. »\n• Engagé : « Cultivons le voisinage. »\n• Ludique : « Des graines et des voisins. »\n\nUn slogan court se retient mieux : visez cinq mots au plus.",
  },
];

const GENERIC: Script = {
  test: /.*/,
  short: [
    "Réponse simulée : cette maquette n'est reliée à aucun modèle. Dans la version réelle, la réponse courte et directe apparaîtrait ici.",
    "Réponse simulée (maquette). La version réelle répondrait ici de façon concise, sans relance.",
  ],
  long: "Réponse simulée : cette maquette n'est reliée à aucun modèle de langage.\n\nDans la version réelle, la réponse développée apporterait ici du contexte, des exemples et des nuances. Elle serait plus longue, donc un peu plus coûteuse à générer, ce que la note d'impact permet de voir.",
  deep: "En mode Approfondi, le modèle raisonnerait d'abord en plusieurs étapes avant de répondre, ce qui mobilise beaucoup plus de calcul.\n\nRéponse simulée : dans la version réelle, une analyse structurée et détaillée apparaîtrait ici.",
};

export function mockReply(text: string, mode: ModeId, expanded: boolean, variant = 0): string {
  const s = SCRIPTS.find((x) => x.test.test(text)) ?? GENERIC;
  if (mode === 'approfondi') return s.deep ?? s.long;
  return expanded ? s.long : s.short[variant % s.short.length];
}

function firstSentence(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  const m = flat.match(/^.*?[.!?](\s|$)/);
  const r = (m ? m[0] : flat).trim();
  return r.length > 120 ? r.slice(0, 117).trimEnd() + '…' : r;
}

/** Résumé simulé pour « Nouvelle conversation avec résumé ». */
export function summarize(conv: Conversation): string {
  const asks = conv.messages
    .filter((m) => m.role === 'user')
    .slice(-4)
    .map((m) => '• ' + firstSentence(m.text));
  const last = [...conv.messages].reverse().find((m) => m.role === 'assistant');
  return [`Sujet : ${conv.title}`, 'Dernières demandes :', ...asks, last ? `Dernier point : ${firstSentence(last.text)}` : '']
    .filter(Boolean)
    .join('\n');
}

export function makeTitle(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > 40 ? t.slice(0, 38).trimEnd() + '…' : t;
}
