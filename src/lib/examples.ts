import categoryData from '../data/examples/categories.json' with { type: 'json' };

export interface ExampleCategory { id: string; label: string; }
export interface PromptExample {
  order: number; id: string; slug: string; title: string; category: string;
  description: string; need: string; prompt: string;
  explanation: { title: string; text: string }[];
  adaptations: string[];
  variables: { name: string; description: string }[];
  keywords: string[]; tool?: string; active: boolean;
}
function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name} : objet invalide.`);
  return value as Record<string, unknown>;
}
function requireText(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} : texte non vide attendu.`);
}
function textList(value: unknown, name: string, min = 1): asserts value is string[] {
  if (!Array.isArray(value) || value.length < min) throw new Error(`${name} : liste incomplète.`);
  value.forEach(item => requireText(item, name));
}
export function validateCategories(value: unknown): ExampleCategory[] {
  if (!Array.isArray(value) || !value.length) throw new Error('categories.json : liste vide ou invalide.');
  const ids = new Set<string>();
  for (const item of value) {
    const category = record(item, 'categories.json');
    requireText(category.id, 'catégorie/id'); requireText(category.label, 'catégorie/label');
    if (ids.has(category.id)) throw new Error('categories.json : identifiant dupliqué.');
    ids.add(category.id);
  }
  return value as ExampleCategory[];
}
export const exampleCategories = validateCategories(categoryData);

export function validateExamples(value: unknown, categories: ExampleCategory[] = exampleCategories): PromptExample[] {
  if (!Array.isArray(value) || !value.length) throw new Error('exemples : liste vide ou invalide.');
  const ids = new Set<string>(), slugs = new Set<string>(), orders = new Set<number>();
  for (const item of value) {
    const example = record(item, 'exemple');
    const name = `exemple ${example.id ?? '(sans identifiant)'}`;
    for (const key of ['id', 'slug', 'title', 'category', 'description', 'need', 'prompt']) requireText(example[key], `${name}/${key}`);
    const id = example.id as string, slug = example.slug as string;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${name} : slug invalide.`);
    if (ids.has(id) || slugs.has(slug)) throw new Error(`${name} : identifiant ou slug dupliqué.`);
    ids.add(id); slugs.add(slug);
    if (!Number.isInteger(example.order) || Number(example.order) < 1 || orders.has(example.order as number)) throw new Error(`${name} : ordre invalide ou dupliqué.`);
    orders.add(example.order as number);
    if (!categories.some(category => category.id === example.category)) throw new Error(`${name} : catégorie inconnue.`);
    if (typeof example.active !== 'boolean') throw new Error(`${name} : active doit être un booléen.`);
    if (example.tool !== undefined) requireText(example.tool, `${name}/tool`);
    textList(example.keywords, `${name}/keywords`);
    textList(example.adaptations, `${name}/adaptations`, 3);
    if (example.adaptations.length > 5) throw new Error(`${name} : cinq adaptations maximum.`);
    if (!Array.isArray(example.explanation) || !example.explanation.length) throw new Error(`${name} : explications manquantes.`);
    for (const value of example.explanation) {
      const explanation = record(value, name);
      requireText(explanation.title, `${name}/explanation/title`); requireText(explanation.text, `${name}/explanation/text`);
    }
    if (!Array.isArray(example.variables)) throw new Error(`${name} : variables manquantes.`);
    const variables = new Set<string>();
    for (const value of example.variables) {
      const variable = record(value, name);
      requireText(variable.name, `${name}/variable/name`); requireText(variable.description, `${name}/variable/description`);
      if (variables.has(variable.name)) throw new Error(`${name} : variable dupliquée.`);
      variables.add(variable.name);
    }
    const used = new Set([...String(example.prompt).matchAll(/\[([^\]\n]+)\]/g)].map(match => match[1]));
    if ([...used].some(name => !variables.has(name)) || [...variables].some(name => !used.has(name))) throw new Error(`${name} : variable non expliquée ou inutilisée.`);
  }
  return (value as PromptExample[]).toSorted((a, b) => a.order - b.order);
}

function searchable(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr').trim();
}
export function filterExamples(examples: PromptExample[], query = '', category = ''): PromptExample[] {
  const terms = searchable(query).split(/\s+/).filter(Boolean);
  return examples.filter(example => {
    const content = searchable([example.title, example.description, example.need, ...example.keywords].join(' '));
    return example.active && (!category || example.category === category) && terms.every(term => content.includes(term));
  });
}
