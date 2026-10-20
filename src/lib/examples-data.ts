import { validateExamples } from './examples.ts';

// Astro/Vite discovers each data file at build time; no runtime request or server is needed.
const files = import.meta.glob('../data/examples/*.json', { eager: true, import: 'default' });
export const examples = validateExamples(Object.entries(files)
  .filter(([file]) => !file.endsWith('/categories.json'))
  .map(([, value]) => value));
export const activeExamples = examples.filter(example => example.active);
