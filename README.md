# PromptOS — Version 1.6

Ateliers pédagogiques de construction de prompts, d’instructions personnalisées et de demandes de plans de veille, avec une bibliothèque de douze exemples, développés avec **Astro 7, Svelte 5 et TypeScript**. L’application assemble de façon déterministe les choix et les mots de l’utilisateur. Elle ne contacte aucune IA et ne nécessite ni compte, ni backend, ni base de données.

## Démarrer

Prérequis : Node.js **22.22 ou supérieur** et npm.

```sh
npm ci
npm run dev
```

Le serveur Astro démarre **en arrière-plan**. Ouvrir l’adresse indiquée par la commande, habituellement http://localhost:4321.

```sh
npm run dev:status
npm run dev:logs
npm run dev:stop
```

Ces scripts correspondent à `astro dev --background`, `astro dev status`, `astro dev logs` et `astro dev stop`.

## Utiliser l’atelier

1. Depuis l’accueil, ouvrir l’atelier.
2. Choisir librement des éléments dans les cinq blocs. Aucun champ n’est obligatoire ; un seul élément suffit.
3. Consulter les encarts « En savoir plus » et ajouter ses précisions si nécessaire.
4. Ouvrir « Prompt final » dans la navigation et cliquer sur « Générer mon prompt ».
5. Copier le résultat, puis le tester dans l’outil d’IA de son choix.

Après une modification, le dernier résultat reste affiché avec un avertissement et sa copie est désactivée jusqu’à la régénération. « Modifier mes choix » conserve le formulaire. « Recommencer » demande confirmation avant d’effacer les choix et le résultat.

Si le presse-papiers est indisponible, le texte est sélectionné et une consigne de copie manuelle s’affiche. L’API Clipboard fonctionne normalement sur HTTPS et localhost.

## Instructions personnalisées

« Personnaliser mon IA » ouvre `/instructions-personnalisees/`. Cinq blocs regroupent **104 options et trois champs libres**, tous facultatifs : comportement, communication, méthode de travail, fiabilité et préférences personnelles. Une seule sélection ou un seul texte libre suffit. Aucun choix, ton ou langue n’est présélectionné.

« Générer mes instructions » assemble uniquement les préférences renseignées, dans l’ordre des sections et des catalogues. Les sections vides sont omises et les formulations strictement identiques ne sont pas répétées. Les mots saisis sont conservés ; seuls les espaces aux extrémités et les retours à la ligne sont normalisés. Le résultat peut être copié, modifié et réinitialisé après confirmation. Une modification rend la copie du dernier résultat indisponible jusqu’à la régénération.

Ces instructions orientent un assistant sans garantir son comportement ni lui donner de nouvelles capacités. Leur emplacement dépend de la plateforme choisie. Les saisies restent en mémoire dans la page et sont perdues au rechargement ; éviter les informations sensibles dans des instructions réutilisables.

## Construire un plan de veille

« Plan de veille » ouvre `/plan-de-veille/`. Cinq étapes regroupent **18 champs facultatifs et 48 options** : sujet et activité, périmètre et repères, recherche de sources, organisation de la veille et présentation du résultat. Les sources connues peuvent être indiquées par leur nom ou leur URL ; il n’est pas nécessaire d’en connaître pour commencer. Un seul repère ou choix suffit pour générer une demande.

Le résultat est un **prompt à copier dans l’assistant IA choisi**, qui devra construire le plan et effectuer une première recherche si ses outils le permettent. PromptOS ne consulte aucun site, n’évalue aucun lien et ne programme aucune surveillance. La méthode commune, expliquée dans l’introduction, demande :

- Une recherche au-delà des sources connues et une distinction entre sources initiales et nouvelles.
- Des titres, auteurs ou éditeurs, URL directes, dates et statuts réels de consultation ; aucune référence inventée.
- Une évaluation provisoire de la pertinence (« forte », « moyenne », « faible » ou « non évaluable »), justifiée par le sujet, l’activité et le périmètre.
- Un examen séparé des indices de fiabilité et des limites ; une source pertinente n’est pas nécessairement fiable, et une source officielle peut être hors périmètre.
- Une stratégie de recherche, un registre des sources, une grille d’évaluation et une routine de collecte, tri, vérification, partage et réévaluation.

La méthode prévoit explicitement les assistants sans accès au Web, les contenus inaccessibles et les informations à vérifier manuellement. Pour un sujet juridique ou réglementaire, elle demande de préciser le territoire, de distinguer textes en vigueur, projets et commentaires, et de vérifier les dates d’application avant une décision. L’apprenant doit ouvrir les références et valider le classement proposé. Les consignes particulières de son exercice peuvent être ajoutées dans les contraintes.

La copie avec repli manuel, l’obsolescence après modification et la réinitialisation confirmée reprennent le fonctionnement des autres ateliers. Aucun choix n’est présélectionné et les textes libres restent inchangés, hors normalisation des retours à la ligne et espaces aux extrémités.

Les options, aides et règles communes sont dans `public/data/watch-plan/` ; leur validation est intégrée au build. Les moteurs des autres ateliers sont inchangés. La grille pédagogique s’appuie notamment sur les repères d’[évaluation des sources de HEC Montréal](https://libguides.hec.ca/evaluer) et sur les [limites des systèmes d’IA générative expliquées par la CNIL](https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative).

## Passer à une veille planifiée

L’étape **07 « Planifier ma veille »** apparaît dès l’ouverture dans le menu et dans la page. Son lien ouvre directement la préparation ; avant génération, un repère permet de rejoindre le résultat du plan. Après génération, le bouton **« Planifier cette veille »** ouvre cette même étape. Le premier prompt reste consacré à la construction du plan. Cette suite facultative produit des instructions distinctes, autonomes, pour **exécuter la veille** plutôt que reconstruire son organisation à chaque occurrence.

1. Relire le plan obtenu dans son assistant, examiner les sources et préciser le sujet dans PromptOS si nécessaire.
2. Choisir une recherche avec synthèse ou un simple rappel, puis une fréquence, une heure et un fuseau explicites. Pour une recherche, choisir aussi la période à examiner ; elle est indépendante de la fréquence. Un jour est nécessaire pour une cadence hebdomadaire ou mensuelle (du 1 au 28). Nom, date de fin, sources retenues et taille de synthèse sont facultatifs.
3. Copier les **instructions à tester** dans l’assistant et vérifier une exécution. Les sources proposées par l’assistant ne sont pas récupérées automatiquement : celles que l’apprenant retient peuvent être recopiées dans le champ prévu.
4. Après un test satisfaisant, copier la **demande de planification** dans la même conversation. Elle demande de vérifier les capacités disponibles pendant les tâches, de présenter le calendrier et d’attendre l’accord de l’apprenant, puis de créer effectivement la tâche si possible. Elle prévoit aussi la saisie manuelle dans le formulaire de l’outil et évite les doublons.
5. Vérifier l’enregistrement dans l’espace de planification, la prochaine occurrence, les notifications, puis les premiers résultats. Repérer comment modifier, suspendre et supprimer la tâche.

Le [guide officiel OpenAI « Scheduled tasks »](https://developers.openai.com/training/walkthroughs/scheduled-tasks) décrit la démarche de test puis de planification. La disponibilité dépend du compte et de l’environnement ; l’existence d’une recherche Web dans une conversation ne garantit pas son accès pendant une tâche. Si la recherche planifiée est indisponible, la demande exige de l’expliquer et de laisser l’apprenant choisir un rappel ou un autre outil. Une description du calendrier n’est jamais présentée comme une preuve de création.

Les instructions récurrentes reprennent le sujet et les repères utiles, demandent des références vérifiables, une pertinence justifiée et un examen distinct de la fiabilité. Elles prévoient l’échec ou l’absence de résultats sans inventer de nouveautés. La comparaison aux exécutions précédentes dépend d’un historique réellement accessible ; le mode « depuis la dernière exécution » prévoit à défaut une période de 31 jours et signale sa limite. Elles n’envoient aucun message à des tiers et ne créent aucune autre tâche. La demande d’activation reste séparée des instructions à enregistrer pour éviter de recréer la planification à chaque occurrence.

Les réglages commencent vides. Un sujet explicite est requis uniquement pour préparer la tâche. Modifier les repères du plan désactive cette préparation et ses copies jusqu’à régénération ; recommencer efface aussi les réglages de planification. PromptOS ne se connecte à aucun compte, ne crée aucune tâche et ne vérifie pas les exécutions externes. Les données et règles de cette étape se trouvent dans `public/data/watch-plan/scheduling.json`, le moteur dans `src/lib/watch-schedule.ts`.

## Outils IA et bibliothèque d’exemples

La page **« Outils IA »**, à l’adresse `/outils-ia/`, rassemble quatre blocs accessibles depuis des raccourcis : les douze exemples de prompts, sept outils IA, deux outils complémentaires et deux chaînes YouTube. Elle remplace l’ancienne entrée « Exemples de prompts » dans le menu et sur l’accueil. L’adresse `/exemples/` redirige vers le bloc des exemples ; les douze URL `/exemples/[slug]/` restent identiques et leurs liens de retour rejoignent ce bloc.

Les outils IA sont Gamma, NotebookLM / Gemini Notebook, Google Gemini, Mammouth AI, Perplexity, ElevenLabs et AnythingLLM. Les outils complémentaires sont Buffer (publication, avec des fonctions IA) et Remotion (création vidéo avec du code, une seule fiche). Les chaînes sont Projets IA et Shubham Sharma, aux adresses indiquées par le formateur. Chaque fiche présente l’usage principal, un résumé, une idée concrète pour commencer et un lien direct qui ouvre un nouvel onglet. AnythingLLM et Remotion comportent un repère sur leur dimension technique. Aucun contenu externe ni vidéo n’est chargé automatiquement.

La sélection éditoriale est centralisée dans `src/data/tools.ts`. Les descriptions des outils ont été vérifiées le 27 octobre 2026 à partir des sites officiels : [Gamma](https://gamma.app/), [Google Gemini](https://support.google.com/gemini/answer/13275745?hl=fr), [NotebookLM / Gemini Notebook](https://support.google.com/gemininotebook/answer/16179559?hl=fr), [Mammouth AI](https://mammouth.ai/), [Perplexity](https://www.perplexity.ai/en-GB/hub), [ElevenLabs](https://elevenlabs.io/), [AnythingLLM](https://docs.anythingllm.com/chatting-with-documents/introduction), [Buffer](https://buffer.com/) et [Remotion](https://www.remotion.dev/). L’adresse historique `notebooklm.google` rejoint désormais la présentation de Gemini Notebook. Les tarifs et quotas ne sont pas reproduits pour éviter des indications rapidement périmées.

Les exemples conservent huit catégories. Leur recherche locale porte sur le titre, la description, le besoin et les mots-clés ; elle ignore la casse et les accents et se combine avec la catégorie. Une action permet de réinitialiser les filtres, y compris quand aucun résultat ne correspond. Cette recherche filtre uniquement les exemples ; les autres blocs restent accessibles.

Chaque fiche possède une URL `/exemples/[slug]/`, un besoin, un prompt copiable, des explications, les variables à remplacer et trois à cinq pistes d’adaptation. Les pages sont générées statiquement et restent consultables sans JavaScript ; la recherche et la copie automatique nécessitent JavaScript. Le cas Gamma prépare un contenu textuel sans promettre de fonctionnalité particulière de l’outil. Le cas documentaire demande de fournir le texte ou le fichier à l’assistant choisi ; PromptOS n’analyse aucun document.

## Vérification et compilation

```sh
npm test
npm run validate:data
npm run check
npm run build
```

- `npm test` : 96 tests avec le moteur natif de Node : les 79 tests existants et 17 tests de préparation des tâches (calendrier, fuseaux, modes, contexte autonome, capacités, confirmation et validation).
- `npm run check` : `astro check`, puis `svelte-check` pour vérifier explicitement les composants Svelte.
- `npm run validate:data` : validation des catalogues et champs des trois ateliers, des règles du plan de veille et de sa planification, des huit catégories et des douze exemples.
- `npm run build` : validation des données, puis génération des pages statiques et de la redirection de l’ancien catalogue dans `dist/`.

L’historique des contrôles de la première version se trouve dans [docs/validation.md](docs/validation.md).

Pour consulter le build de production :

```sh
npm run preview
```

## Architecture

```text
public/data/                  14 catalogues JSON + field-help.json
public/data/personalization/  17 catalogues indépendants + field-help.json
public/data/watch-plan/       Catalogues, aides et règles communes du plan de veille
src/data/examples/            12 fiches JSON + categories.json
src/data/tools.ts             Sélection éditoriale des outils et chaînes YouTube
src/layouts/BaseLayout.astro  Structure, navigation et pied de page
src/pages/                    Accueil, trois ateliers, catalogue et route statique des exemples
src/components/ui/            Champ réutilisable, aide dépliable et copie avec repli
src/components/workshop/      État centralisé, navigation, résultat, copie et confirmation
src/components/personalization/ État et résultat du nouvel atelier
src/components/watch/         État et résultat de l’atelier de plan de veille
src/components/examples/      Catalogue, recherche et catégories
src/lib/prompt-types.ts       Types et état initial
src/lib/data-loader.ts        Import et validation des données à la compilation
src/lib/validation.ts         Validation des catalogues et de la configuration des champs
src/lib/prompt-builder.ts     Fonction pure buildPrompt(formState)
src/lib/personalization-*.ts   Types, données, validation et moteur distinct de personnalisation
src/lib/examples.ts           Types, validation et filtre local des exemples
src/lib/examples-data.ts      Découverte des fichiers JSON à la compilation
src/lib/watch-plan-*.ts       Types, validation, données et moteur distinct pour la veille
src/lib/watch-schedule.ts     Validation du calendrier et consignes autonomes pour une tâche externe
src/styles/global.css        Identité et mise en page responsive
tests/                        Tests du moteur et des configurations
```

Chaque atelier possède un composant racine Svelte hydraté avec `client:load`. Les moteurs et données des trois ateliers restent distincts. Le composant de champ reçoit explicitement ses options ; les aides et les styles sont partagés. Aucun composant ne contient de liste de choix pédagogique.

## Modifier les choix pédagogiques

Modifier le catalogue correspondant dans `public/data/`. Chaque option possède un identifiant stable, indépendant de son libellé :

```json
{
  "id": "trainer",
  "label": "Formateur",
  "promptText": "Adopte le rôle d’un formateur.",
  "description": "Oriente les réponses vers une démarche pédagogique.",
  "active": true
}
```

`description` est facultatif. Les autres propriétés sont obligatoires. L’ordre du tableau définit l’ordre de présentation et d’assemblage. `active: false` masque l’option et l’exclut du prompt. Les identifiants doivent être uniques dans chaque catalogue.

La plupart des `promptText` sont des phrases complètes. Trois catalogues contiennent des **fragments grammaticaux** que le moteur relie avec des virgules et « et » :

- `contexts.json` : « un contexte professionnel », « un contexte de formation » ; préfixe « Cette demande s’inscrit dans ».
- `domains.json` : « des ressources humaines », « de la comptabilité » ; préfixe « Le résultat doit s’inscrire dans le domaine ».
- `avoid-elements.json` : « le jargon technique non expliqué » ; préfixe « Évite ».

Conserver ce principe pour obtenir une phrase correcte avec un ou plusieurs choix. Les aides, les libellés, les placeholders et les introductions des blocs sont centralisés dans `field-help.json`. Les textes libres ne sont pas reformulés : seuls les espaces aux extrémités et les retours à la ligne sont normalisés.

Relancer les vérifications après modification. Un catalogue invalide bloque la compilation avec une erreur identifiant le catalogue et la propriété en cause. Les tests de couverture des listes initiales sont à adapter si une option du périmètre V1 est volontairement retirée.

Les catalogues de personnalisation se modifient dans `public/data/personalization/` avec le même format. Chaque `promptText` est une instruction complète. Les types, les identifiants et les correspondances de fichiers sont contrôlés par `personalization-types.ts` et `personalization-validation.ts` ; les textes libres et leurs préfixes sont définis dans le nouveau `field-help.json`.

Pour ajouter un exemple, créer un fichier dans `src/data/examples/` à partir d’une fiche existante. Donner un `id`, un `slug` et un `order` uniques, choisir une catégorie existante, renseigner le prompt, les explications, trois à cinq adaptations, les variables utilisées et les mots-clés. `active: false` retire la fiche du catalogue et des routes. La découverte des fichiers est automatique : aucune page ou composant supplémentaire n’est nécessaire. Lancer les validations et reconstruire le site ; adapter le test du nombre initial de fiches lorsque le catalogue évolue volontairement.

## Confidentialité et fonctionnement local

Les saisies restent en mémoire dans la page ; elles sont perdues au rechargement ou à la fermeture. Aucun cookie applicatif, historique, localStorage, suivi ou appel d’API n’est utilisé. Les textes sont rendus par Svelte et dans des zones de texte, sans interprétation HTML.

Les polices Space Grotesk et DM Sans sont incluses dans le build via Fontsource. Aucune police distante ni autre service externe n’est nécessaire. Après chargement complet d’un atelier, sa construction et sa copie fonctionnent sans réseau. La navigation ou le rechargement nécessitent que les fichiers statiques restent accessibles : aucun service worker n’est inclus.

## Déploiement statique

Après `npm run build`, copier **tout le contenu de `dist/`** sur un hébergement statique, avec `index.html` comme document par défaut. Les routes principales sont `/`, `/atelier/`, `/instructions-personnalisees/`, `/plan-de-veille/` et `/outils-ia/`, accompagnées des douze pages `/exemples/[slug]/` et de la redirection HTML `/exemples/`. Aucun serveur Node n’est nécessaire en production. Servir le site en HTTPS pour la copie dans le presse-papiers.

La configuration actuelle suppose un hébergement à la racine d’un domaine. Un hébergement dans un sous-dossier demanderait d’adapter `base` et les liens internes.

Les niveaux 2 et 3, l’IA intégrée, l’authentification, la persistance et l’administration restent hors périmètre.
