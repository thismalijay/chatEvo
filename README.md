# Chat Evo — maquette interactive

Chatbot d'IA générative qui aide à proportionner son usage à ses besoins réels (avant, au moment du choix du
modèle, pendant l'échange), sans culpabiliser, sans gamification de l'engagement individuel et sans dégrader
l'expérience.

> Maquette : réponses **simulées** (pas d'API), impacts en **ordres de grandeur illustratifs**.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173. Pour relancer le didacticiel : http://localhost:5173/?accueil

Stack : Vite, React, TypeScript, Tailwind CSS, Recharts, Lucide. Données dans le navigateur (localStorage).

## Architecture

```
src/
├─ config.ts                 nom du projet (APP_NAME) et version (changer la version réaffiche le didacticiel)
├─ data/demoData.ts          TOUTES les données fictives, modifiables : 30 jours d'usage, heatmap, tâches,
│                            amis, niveaux d'ambition, défis, fils de conversation de démo
├─ lib/
│  ├─ energy.ts              modèle d'estimation (3 modes) et équivalences
│  ├─ router.ts              routeur simulé (complexité), alternatives « avant l'IA », changement de sujet
│  ├─ mock.ts                réponses courtes / développées / approfondies, résumé
│  ├─ features.ts            les 13 fonctionnalités : levier + bénéfice (« Pourquoi ? », réglages, démo)
│  └─ storage.ts, types.ts
├─ state/store.tsx           état global, actions, 5 scénarios prédéfinis
└─ components/
   ├─ brand/                 WaterTexture (texture signature SVG, 3 variantes), Orb (logo animé)
   ├─ layout/                Sidebar (historique repliable), Header (Mon usage, Défis, Réglages, thème, démo)
   ├─ chat/                  ChatScreen (accueil, jauge, nouvelle conversation), Composer (modes, estimation,
   │                         routage, alternatives), Message (note d'impact, Développer, régénération)
   ├─ usage/UsagePage.tsx    tableau de bord sombre + comparaison entre amis (opt-in)
   ├─ challenges/            défis coopératifs, création, carte de partage
   ├─ Onboarding.tsx, SettingsPage.tsx, GuidedDemo.tsx, MethodDialog.tsx, ui.tsx
```

Deux ambiances avec une seule identité : jetons de couleur en variables CSS (`src/index.css`), basculés par la
classe `dark`. Chat, accueil et réglages suivent le thème choisi (clair, sombre ou automatique) ; « Mon usage » et
« Défis » sont toujours en ambiance sombre « dashboard ».

## Démo

- **Démo guidée** (en-tête) : panneau flottant, non bloquant, qui parcourt les 13 fonctionnalités ; « Montrer »
  prépare l'écran correspondant.
- **5 scénarios prédéfinis** (dans le panneau de démo) :
  1. Question simple : « Quelle est la capitale de l'Australie ? »
  2. Question complexe : « Compare les théories UTAUT et TAM et analyse leurs limites »
  3. Conversion d'unités : « Combien font 250 g en tasses ? »
  4. Changement de sujet : long fil sur un exposé, puis une question sur une recette
  5. Régénération : fil « slogan », cliquer sur « Régénérer »
- « Réglages → Réinitialiser les données de démo » remet tout à zéro.

## Les 13 fonctionnalités et leurs leviers

| # | Fonctionnalité | Moment | Levier comportemental |
|---|---|---|---|
| 1 | Sélecteur de mode à côté du bouton d'envoi | Choix | Timely (EAST), conditions facilitantes, effet de cadrage |
| 2 | Estimation avant envoi (neutre → ambre doux) | Choix | Saillance (MINDSPACE), Timely, heuristique de disponibilité corrigée |
| 3 | Suggestion intelligente de mode (routage transparent) | Choix | Défaut + Easy (EAST), évite l'aversion à la perte |
| 4 | Note d'impact sous chaque réponse | Pendant | Saillance, équivalents parlants, retour d'information |
| 5 | Jauge de conversation et nouvelle conversation (avec résumé) | Pendant | Saillance du coût caché de l'historique, Timely, Easy |
| 6 | Réponses courtes par défaut et « Développer » | Pendant | Défaut (Ebeling & Lotz), Easy, proportionnalité |
| 7 | Régénération responsable | Pendant | Récompense variable (« machine à sous »), Timely |
| 8 | Alternatives « avant l'IA » | Avant | Proportionnalité, habitude et mémoire procédurale |
| 9 | Didacticiel en 3 écrans | Avant | Moment de transition (habit discontinuity), engagement, statu quo |
| 10 | Mon usage (tableau de bord) | Sur la durée | Retour cumulé, écart entre les soi, rapport qualité-prix visible |
| 11 | Défis coopératifs entre amis | Sur la durée | Engagement, normes sociales descriptives, fixation d'objectifs, incitation positive |
| 12 | Réglages et « Pourquoi ces choix ? » | Toujours | Transparence, autonomie, réversibilité |
| 13 | Écran d'accueil | Avant | Défaut, Easy, absence d'injonction |

Chaque composant indique en commentaire le levier qu'il vise.

## Modèle d'estimation

`src/lib/energy.ts` : Énergie = a × tokens d'entrée (historique compris) + b × tokens générés.
Réponse rapide ≈ 0,2 Wh, Équilibré ≈ 0,3 Wh, Approfondi ≈ 5 à 30 Wh. Équivalences : micro-ondes (0,2 Wh ≈ 0,7 s),
ampoule LED 10 W (1 Wh ≈ 6 min). Ordres de grandeur illustratifs (Oviedo et al., 2025 ; Luccioni et al., 2024 ;
Ruf & Detyniecki, 2025).

## Texture signature

`src/components/brand/WaterTexture.tsx` affiche la photo `public/assets/water-texture.jpg` (reflets de lumière dans
l'eau) en `object-fit: cover`, avec 3 cadrages différents et une dérive lente. Pour changer de texture, remplacer
simplement ce fichier.
