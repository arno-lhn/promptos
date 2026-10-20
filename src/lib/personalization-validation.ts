import { personalizationControls, personalizationCatalogFiles, type PersonalizationCatalogId, type PersonalizationSection } from './personalization-types.ts';
import { validateCatalog } from './validation.ts';

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}
export function validatePersonalizationSections(value: unknown, rawCatalogs: Record<string, unknown>): PersonalizationSection[] {
  const fail = (message: string): never => { throw new Error(`personalization/field-help.json : ${message}`); };
  if (!Array.isArray(value) || value.length !== 5) fail('cinq sections sont attendues.');
  const fields = new Set<string>();
  const ids = new Set<string>();
  const catalogNames = new Set<string>();
  for (const section of value as unknown[]) {
    if (!record(section)) fail('section invalide.');
    const item = section as Record<string, unknown>;
    for (const key of ['id', 'title', 'promptTitle', 'description']) if (!text(item[key])) fail(`${key} manquant.`);
    if (ids.has(item.id as string)) fail('section dupliquée.');
    ids.add(item.id as string);
    if (item.note !== undefined && typeof item.note !== 'string') fail('note invalide.');
    if (!Array.isArray(item.fields) || !item.fields.length) fail('champs invalides.');
    for (const field of item.fields as unknown[]) {
      if (!record(field) || !text(field.id) || !Object.hasOwn(personalizationControls, field.id) || fields.has(field.id)) fail('champ inconnu ou dupliqué.');
      const entry = field as Record<string, unknown>;
      const id = entry.id as keyof typeof personalizationControls;
      fields.add(id);
      for (const key of ['label', 'help']) if (!text(entry[key])) fail(`${key} manquant pour ${id}.`);
      if (entry.type !== personalizationControls[id]) fail(`type invalide pour ${id}.`);
      if (entry.placeholder !== undefined && typeof entry.placeholder !== 'string') fail(`placeholder invalide pour ${id}.`);
      if (entry.layout !== undefined && entry.layout !== 'list') fail(`disposition invalide pour ${id}.`);
      if (entry.type === 'textarea') {
        if (entry.catalog !== undefined || !text(entry.promptPrefix)) fail(`préfixe ou catalogue invalide pour ${id}.`);
      } else {
        if (!text(entry.catalog) || entry.catalog !== personalizationCatalogFiles[id as PersonalizationCatalogId] || catalogNames.has(entry.catalog as string) || !Object.hasOwn(rawCatalogs, id)) fail(`catalogue absent, inconnu ou dupliqué pour ${id}.`);
        if (entry.promptPrefix !== undefined) fail(`préfixe inattendu pour ${id}.`);
        catalogNames.add(entry.catalog as string);
        validateCatalog(rawCatalogs[id], `personalization/${entry.catalog}.json`);
      }
    }
  }
  if (fields.size !== Object.keys(personalizationControls).length) fail('champs manquants.');
  const expected = Object.entries(personalizationControls).filter(([, type]) => type !== 'textarea').map(([id]) => id);
  if (Object.keys(rawCatalogs).length !== expected.length || Object.keys(rawCatalogs).some(id => !expected.includes(id))) fail('correspondance des catalogues invalide.');
  return value as PersonalizationSection[];
}
