# Validation de PromptOS V1

Vérifications réalisées le 15 octobre 2026 dans l’environnement Windows du projet.

## Contrôles automatisés

- `npm test` : 20 tests réussis. Chaque option des 14 catalogues est également testée individuellement.
- `npm run check` : aucune erreur ni avertissement Astro ou Svelte.
- `npm run build` : deux pages statiques générées ; validation des catalogues exécutée avant compilation.

## Essais fonctionnels dans le navigateur

| Scénario                         | Résultat observé                                                             |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Accueil et lien principal        | Accès direct à l’atelier sans inscription                                    |
| Formulaire vide                  | Génération désactivée et consigne explicative affichée                       |
| Menus des cinq blocs             | Sélections prises en compte dans le résultat                                 |
| Radios et cases à cocher         | Sélection, effacement des radios et désélection des cases opérationnels      |
| Aides                            | 17 encarts présents, ouverture d’une aide vérifiée                           |
| Génération complète              | Cinq sections dans l’ordre prévu et formulations des options sélectionnées   |
| Texte libre seul                 | Génération possible sans sélectionner de rôle, tâche ou autre option         |
| Conservation de la saisie        | Doubles espaces et retours à la ligne conservés                              |
| Copie                            | Message de succès affiché dans le navigateur                                 |
| Modification                     | Retour au formulaire sans perte des sélections                               |
| Résultat obsolète                | Dernier résultat conservé, avertissement visible, copie désactivée           |
| Régénération                     | Résultat actualisé et copie réactivée                                        |
| Annulation de réinitialisation   | Choix conservés, fermeture de la confirmation                                |
| Confirmation de réinitialisation | Aucun champ rempli, aucune sélection, aucun résultat ; génération désactivée |
| Mobile 390 px                    | Accueil et génération utilisables, aucun débordement horizontal              |
| Mobile 320 px                    | Accueil et atelier sans débordement horizontal                               |

Autres vérifications : à 768 px, l’atelier passe sur une colonne sans débordement. Une saisie contenant des balises HTML reste affichée comme du texte. Le build statique servi par `astro preview` permet également de générer un prompt ; aucun avertissement ni erreur n’a été observé dans la console du navigateur.

## Accessibilité et périmètre des vérifications

Les champs utilisent des labels associés, des fieldsets et legends pour les groupes, des contrôles HTML natifs, des indicateurs de focus et des états de sélection natifs. Un lien d’évitement est présent ; les notifications de copie et d’obsolescence utilisent `role="status"`. Le dialogue de confirmation place initialement le focus sur l’action de conservation et permet l’annulation.

Les vérifications techniques et les essais de mise en page ne constituent pas un audit complet de conformité WCAG 2.2 AA ni une campagne sur tous les lecteurs d’écran et navigateurs. Cet audit pourra être effectué avant une diffusion élargie.

Les erreurs de copie disposent d’un repli par sélection manuelle dans le code. Le scénario de refus du presse-papiers n’a pas été forcé dans le navigateur de cette session.
