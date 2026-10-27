import { watchCatalogs, watchRules, watchSections } from './watch-plan-data.ts';
import type { WatchCatalogId, WatchCatalogs, WatchState } from './watch-plan-types.ts';

export function buildWatchPrompt(state: WatchState, catalogs: WatchCatalogs = watchCatalogs): string {
  const seen = new Set<string>();
  const sections = watchSections.map(section => {
    const lines = section.fields.flatMap(field => {
      const value = state[field.id];
      if (field.type === 'textarea') {
        const normalized = typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '';
        return normalized ? [`${field.promptPrefix}\n\n${normalized}`] : [];
      }
      if (field.type === 'checkbox' ? !Array.isArray(value) : typeof value !== 'string') return [];
      return (catalogs[field.id as WatchCatalogId] ?? []).filter(option => option.active &&
        (Array.isArray(value) ? value.includes(option.id) : value === option.id),
      ).flatMap(option => {
        const text = option.promptText.trim();
        if (!text || seen.has(text)) return [];
        seen.add(text);
        return [text];
      });
    });
    return lines.length ? `## ${section.promptTitle}\n\n${lines.join('\n\n')}` : '';
  }).filter(Boolean);
  // The method is always included in a meaningful prompt, but must not enable an empty form.
  if (!sections.length) return '';
  return [
    `# MA DEMANDE\n\n${watchRules.introduction}`,
    `# MES REPÈRES\n\n${sections.join('\n\n\n')}`,
    `# MÉTHODE DE RECHERCHE ET DE VÉRIFICATION\n\n${watchRules.methodology.join('\n\n')}`,
    `# PLAN DE VEILLE ATTENDU\n\n${watchRules.expectedOutput.join('\n\n')}`,
  ].join('\n\n\n');
}
export function isWatchPromptStale(state: WatchState, result: string): boolean {
  return Boolean(result) && buildWatchPrompt(state) !== result;
}
