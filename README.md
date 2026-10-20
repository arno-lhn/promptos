# PromptOS — Version 1.3

Ateliers pédagogiques de construction de prompts et d’instructions personnalisées, avec une bibliothèque de douze exemples, développés avec **Astro 7, Svelte 5 et TypeScript**. L’application assemble de façon déterministe les choix et les mots de l’utilisateur. Elle ne contacte aucune IA et ne nécessite ni compte, ni backend, ni base de données.

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

## Bibliothèque d’exemples

`/exemples/` propose douze cas pratiques et huit catégories. La recherche locale porte sur le titre, la description, le besoin et les mots-clés ; elle ignore la casse et les accents et se combine avec la catégorie. Une action permet de réinitialiser les filtres, y compris quand aucun résultat ne correspond.

Chaque fiche possède une URL `/exemples/[slug]/`, un besoin, un prompt copiable, des explications, les variables à remplacer et trois à cinq pistes d’adaptation. Les pages sont générées statiquement et restent consultables sans JavaScript ; la recherche et la copie automatique nécessitent JavaScript. Le cas Gamma prépare un contenu textuel sans promettre de fonctionnalité particulière de l’outil. Le cas documentaire demande de fournir le texte ou le fichier à l’assistant choisi ; PromptOS n’analyse aucun document.

## Vérification et compilation

```sh
npm test
npm run validate:data
npm run check
npm run build
```

- `npm test` : 52 tests avec le moteur natif de Node, dont les 20 tests historiques du moteur de prompts, ainsi que la personnalisation, les combinaisons de préférences, les douze exemples, les filtres et la validation des données.
- `npm run check` : `astro check`, puis `svelte-check` pour vérifier explicitement les composants Svelte.
- `npm run validate:data` : validation des 14 catalogues et 17 champs initiaux, des 17 catalogues et 20 champs de personnalisation, des huit catégories et des douze exemples.
- `npm run build` : validation des données, puis génération de 16 pages statiques dans `dist/`.

L’historique des contrôles de la première version se trouve dans [docs/validation.md](docs/validation.md).

Pour consulter le build de production :

```sh
npm run preview
```

## Architecture

```text
public/data/                  14 catalogues JSON + field-help.json
public/data/personalization/  17 catalogues indépendants + field-help.json
src/data/examples/            12 fiches JSON + categories.json
src/layouts/BaseLayout.astro  Structure, navigation et pied de page
src/pages/                    Accueil, deux ateliers, catalogue et route statique des exemples
src/components/ui/            Champ réutilisable, aide dépliable et copie avec repli
src/components/workshop/      État centralisé, navigation, résultat, copie et confirmation
src/components/personalization/ État et résultat du nouvel atelier
src/components/examples/      Catalogue, recherche et catégories
src/lib/prompt-types.ts       Types et état initial
src/lib/data-loader.ts        Import et validation des données à la compilation
src/lib/validation.ts         Validation des catalogues et de la configuration des champs
src/lib/prompt-builder.ts     Fonction pure buildPrompt(formState)
src/lib/personalization-*.ts   Types, données, validation et moteur distinct de personnalisation
src/lib/examples.ts           Types, validation et filtre local des exemples
src/lib/examples-data.ts      Découverte des fichiers JSON à la compilation
src/styles/global.css        Identité et mise en page responsive
tests/                        Tests du moteur et des configurations
```

Chaque atelier possède un composant racine Svelte hydraté avec `client:load`. Les moteurs et données des deux ateliers restent distincts. Le composant de champ reçoit explicitement ses options ; les aides et les styles sont partagés. Aucun composant ne contient de liste de choix pédagogique.

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

Après `npm run build`, copier **tout le contenu de `dist/`** sur un hébergement statique, avec `index.html` comme document par défaut. Les routes principales sont `/`, `/atelier/`, `/instructions-personnalisees/` et `/exemples/`, accompagnées des douze pages `/exemples/[slug]/`. Aucun serveur Node n’est nécessaire en production. Servir le site en HTTPS pour la copie dans le presse-papiers.

La configuration actuelle suppose un hébergement à la racine d’un domaine. Un hébergement dans un sous-dossier demanderait d’adapter `base` et les liens internes.

Les niveaux 2 et 3, l’IA intégrée, l’authentification, la persistance et l’administration restent hors périmètre.
