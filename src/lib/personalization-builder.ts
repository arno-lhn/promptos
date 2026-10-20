import { personalizationCatalogs, personalizationSections } from './personalization-data.ts';
import type { PersonalizationCatalogId, PersonalizationCatalogs, PersonalizationState } from './personalization-types.ts';

export function buildPersonalization(state: PersonalizationState, catalogs: PersonalizationCatalogs = personalizationCatalogs): string {
  const seen = new Set<string>();
  return personalizationSections.map(section => {
    const lines = section.fields.flatMap(field => {
      const value = state[field.id];
      if (field.type === 'textarea') {
        const text = typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '';
        return text ? [`${field.promptPrefix}\n\n${text}`] : [];
      }
      // Iterate the catalogue, never the click order. Ignore unknown and inactive IDs.
      return (catalogs[field.id as PersonalizationCatalogId] ?? []).filter(option => option.active &&
        (Array.isArray(value) ? value.includes(option.id) : value === option.id),
      ).flatMap(option => {
        const text = option.promptText.trim();
        if (!text || seen.has(text)) return [];
        seen.add(text);
        return [text];
      });
    });
    return lines.length ? `# ${section.promptTitle}\n\n${lines.join('\n\n')}` : '';
  }).filter(Boolean).join('\n\n\n');
}

export function isPersonalizationStale(state: PersonalizationState, result: string): boolean {
  return Boolean(result) && buildPersonalization(state) !== result;
}
