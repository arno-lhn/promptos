# PromptOS — Version 1

Atelier pédagogique de construction de prompts, développé avec **Astro 7, Svelte 5 et TypeScript**. L’application assemble de façon déterministe les choix et les mots de l’utilisateur. Elle ne contacte aucune IA et ne nécessite ni compte, ni backend, ni base de données.

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

## Vérification et compilation

```sh
npm test
npm run validate:data
npm run check
npm run build
```

- `npm test` : 20 tests avec le moteur natif de Node, couvrant les champs indépendants, les 195 options, l’ordre stable, les sélections multiples, les valeurs inconnues, la conservation des textes, l’obsolescence et la validation.
- `npm run check` : `astro check`, puis `svelte-check` pour vérifier explicitement les composants Svelte.
- `npm run validate:data` : validation des 14 catalogues et des 17 aides pédagogiques.
- `npm run build` : validation des données, puis génération statique dans `dist/`.

Les tests fonctionnels effectués dans le navigateur sont détaillés dans [docs/validation.md](docs/validation.md).

Pour consulter le build de production :

```sh
npm run preview
```

## Architecture

```text
public/data/                  14 catalogues JSON + field-help.json
src/layouts/BaseLayout.astro  Structure, navigation et pied de page
src/pages/                    Accueil et atelier
src/components/ui/            Champ réutilisable et aide dépliable
src/components/workshop/      État centralisé, navigation, résultat, copie et confirmation
src/lib/prompt-types.ts       Types et état initial
src/lib/data-loader.ts        Import et validation des données à la compilation
src/lib/validation.ts         Validation des catalogues et de la configuration des champs
src/lib/prompt-builder.ts     Fonction pure buildPrompt(formState)
src/styles/global.css        Identité et mise en page responsive
tests/                        Tests du moteur et des configurations
```

Un composant racine Svelte est hydraté avec `client:load`. Les cinq sections utilisent un même composant de champ configuré par JSON. Aucun composant ne contient de liste de choix pédagogique.

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

## Confidentialité et fonctionnement local

Les saisies restent en mémoire dans la page ; elles sont perdues au rechargement ou à la fermeture. Aucun cookie applicatif, historique, localStorage, suivi ou appel d’API n’est utilisé. Les textes sont rendus par Svelte et dans des zones de texte, sans interprétation HTML.

Les polices Space Grotesk et DM Sans sont incluses dans le build via Fontsource. Aucune police distante ni autre service externe n’est nécessaire. Après chargement complet de l’atelier, sa construction et sa copie fonctionnent sans réseau. La navigation ou le rechargement nécessitent que les fichiers statiques restent accessibles : la V1 n’inclut pas de service worker.

## Déploiement statique

Après `npm run build`, copier **tout le contenu de `dist/`** sur un hébergement statique, avec `index.html` comme document par défaut. Les deux routes sont `/` et `/atelier/` ; aucun serveur Node n’est nécessaire en production. Servir le site en HTTPS pour la copie dans le presse-papiers.

La configuration actuelle suppose un hébergement à la racine d’un domaine. Un hébergement dans un sous-dossier demanderait d’adapter `base` et les liens internes.

Aucun déploiement, push ou changement des paramètres GitHub n’a été effectué dans cette livraison. Les niveaux 2 et 3, l’IA intégrée, l’authentification, la persistance et l’administration restent hors périmètre.
