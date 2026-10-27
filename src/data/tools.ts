export interface LearningResource {
  id: string;
  name: string;
  url: string;
  group: 'ai' | 'complementary' | 'learning';
  purpose: string;
  description: string;
  example: string;
  note?: string;
}

// Editorial selection: official product sites and the two channels selected by the trainer.
// Descriptions checked against publisher sources on 27 October 2026; no live requests in the site.
export const learningResources: LearningResource[] = [
  {
    id: 'gamma', name: 'Gamma', url: 'https://gamma.app/', group: 'ai', purpose: 'Présentations et supports',
    description: 'Transforme une idée, un texte ou un plan en présentation, document ou page Web avec l’aide de l’IA. Vous pouvez ensuite retravailler le contenu et la mise en forme.',
    example: 'Préparer un premier support de formation à partir d’un plan déjà structuré.',
  },
  {
    id: 'notebooklm', name: 'NotebookLM / Gemini Notebook', url: 'https://notebooklm.google/', group: 'ai', purpose: 'Comprendre ses documents',
    description: 'L’assistant documentaire de Google aide à interroger et à synthétiser les sources ajoutées à un carnet. Les références aux passages utilisés permettent de revenir aux documents pour vérifier les réponses.',
    example: 'Comparer plusieurs documents de cours et en tirer une fiche de révision.',
  },
  {
    id: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com/', group: 'ai', purpose: 'Assistant polyvalent',
    description: 'L’assistant IA de Google accompagne la rédaction, la recherche d’idées, les explications et la préparation de plans. Il permet d’échanger pour préciser ou améliorer une première réponse.',
    example: 'Demander une explication accessible, puis un exercice pour vérifier sa compréhension.',
  },
  {
    id: 'mammouth', name: 'Mammouth AI', url: 'https://mammouth.ai/', group: 'ai', purpose: 'Plusieurs modèles au même endroit',
    description: 'Réunit plusieurs modèles d’IA pour le texte et l’image dans une même interface. Utile pour explorer différentes réponses à un besoin et comparer les propositions des modèles disponibles.',
    example: 'Tester une même demande de reformulation avec plusieurs modèles, puis comparer les résultats.',
  },
  {
    id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/', group: 'ai', purpose: 'Recherche et réponses sourcées',
    description: 'Associe recherche sur le Web et réponses rédigées avec des références. Il aide à explorer un sujet et à repérer des pistes ; les liens cités restent à ouvrir pour examiner les informations.',
    example: 'Lancer une première recherche pour son plan de veille et examiner les sources proposées.',
  },
  {
    id: 'elevenlabs', name: 'ElevenLabs', url: 'https://elevenlabs.io/', group: 'ai', purpose: 'Voix et audio',
    description: 'Propose des outils d’IA pour transformer du texte en voix et travailler des contenus audio, notamment pour la narration ou le doublage.',
    example: 'Créer une narration à partir du texte relu d’une courte capsule pédagogique.',
  },
  {
    id: 'anythingllm', name: 'AnythingLLM', url: 'https://anythingllm.com/', group: 'ai', purpose: 'Assistant et documents',
    description: 'Permet de discuter avec des modèles d’IA et de travailler avec ses documents dans des espaces dédiés. La version de bureau peut utiliser des modèles exécutés sur l’ordinateur.',
    example: 'Explorer un assistant qui répond à partir d’un ensemble de documents professionnels.',
    note: 'À explorer avec quelques repères techniques : le matériel et le choix d’un modèle local ou distant influencent le fonctionnement.',
  },
  {
    id: 'buffer', name: 'Buffer', url: 'https://buffer.com/', group: 'complementary', purpose: 'Organisation des publications',
    description: 'Aide à préparer, organiser et programmer des publications sur les réseaux sociaux. Son usage principal est la gestion des contenus ; il propose aussi un assistant IA pour les retravailler.',
    example: 'Préparer un calendrier de publications et programmer des contenus déjà relus.',
  },
  {
    id: 'remotion', name: 'Remotion', url: 'https://www.remotion.dev/', group: 'complementary', purpose: 'Création vidéo avec du code',
    description: 'Permet de créer des vidéos et des animations avec React, une technologie de développement Web. Il sert notamment à fabriquer des modèles de vidéos réutilisables et à automatiser leur production.',
    example: 'Produire plusieurs variantes d’une vidéo à partir du même modèle.',
    note: 'Pour un public technique : ce n’est pas un générateur de vidéos IA prêt à l’emploi, même s’il peut s’intégrer à un travail avec des agents IA.',
  },
  {
    id: 'projets-ia', name: 'Projets IA', url: 'https://www.youtube.com/@ProjetsIA', group: 'learning', purpose: 'Comprendre la technique',
    description: 'Une chaîne YouTube pour approfondir les aspects techniques de l’intelligence artificielle à travers des explications et des projets. Une piste pour aller plus loin, progressivement, après les premiers usages.',
    example: 'Choisir une vidéo sur une notion rencontrée en cours et noter ce que l’on souhaite approfondir.',
  },
  {
    id: 'shubham-sharma', name: 'Shubham Sharma', url: 'https://www.youtube.com/@Shubham_Sharma', group: 'learning', purpose: 'IA, automatisation et usages concrets',
    description: 'Une chaîne YouTube autour de l’IA, de l’automatisation et des outils numériques, avec des démonstrations et des cas pratiques pour comprendre comment les intégrer à ses activités.',
    example: 'Observer un exemple d’automatisation, puis repérer les étapes que l’on pourrait adapter à son propre travail.',
  },
];
