import { validateCatalog } from './validation.ts';
import { watchControls, type WatchCatalogs, type WatchFieldId, type WatchRules, type WatchSection } from './watch-plan-types.ts';

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`watch-plan/${name} : objet invalide.`);
  }
  return value as Record<string, unknown>;
}
function text(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`watch-plan/${name} : texte non vide attendu.`);
  }
}
export function validateWatchCatalogs(value: unknown): WatchCatalogs {
  const catalogs = record(value, 'catalogs.json');
  const expected = Object.entries(watchControls).filter(([, type]) => type !== 'textarea').map(([id]) => id);
  if (Object.keys(catalogs).length !== expected.length || expected.some(id => !Object.hasOwn(catalogs, id))) {
    throw new Error('watch-plan/catalogs.json : correspondance des catalogues invalide.');
  }
  for (const id of expected) validateCatalog(catalogs[id], `watch-plan/catalogs.json/${id}`);
  return catalogs as WatchCatalogs;
}
export function validateWatchSections(value: unknown): WatchSection[] {
  if (!Array.isArray(value) || value.length !== 5) throw new Error('watch-plan/field-help.json : cinq sections attendues.');
  const fields = new Set<string>(), sections = new Set<string>();
  for (const item of value) {
    const section = record(item, 'field-help.json');
    for (const key of ['id', 'title', 'promptTitle', 'description']) text(section[key], `section/${key}`);
    const id = section.id as string;
    if (!/^watch-[a-z-]+$/.test(id) || sections.has(id)) throw new Error('watch-plan : identifiant de section invalide ou dupliqué.');
    sections.add(id);
    if (!Array.isArray(section.fields) || !section.fields.length) throw new Error('watch-plan : champs invalides.');
    for (const item of section.fields) {
      const field = record(item, 'field');
      text(field.id, 'field/id');
      if (!Object.hasOwn(watchControls, field.id) || fields.has(field.id)) throw new Error('watch-plan : champ inconnu ou dupliqué.');
      fields.add(field.id);
      if (field.type !== watchControls[field.id as WatchFieldId]) throw new Error(`watch-plan : type invalide pour ${field.id}.`);
      text(field.label, `${field.id}/label`); text(field.help, `${field.id}/help`);
      if (field.placeholder !== undefined && typeof field.placeholder !== 'string') throw new Error('watch-plan : placeholder invalide.');
      if (field.layout !== undefined && field.layout !== 'list') throw new Error('watch-plan : disposition invalide.');
      if (field.type === 'textarea') text(field.promptPrefix, `${field.id}/promptPrefix`);
      else if (field.promptPrefix !== undefined) throw new Error('watch-plan : préfixe réservé aux textes libres.');
    }
  }
  if (fields.size !== Object.keys(watchControls).length) throw new Error('watch-plan : champs manquants.');
  return value as WatchSection[];
}
export function validateWatchRules(value: unknown): WatchRules {
  const rules = record(value, 'rules.json');
  text(rules.introduction, 'rules/introduction');
  for (const key of ['summary', 'methodology', 'expectedOutput']) {
    const list = rules[key];
    if (!Array.isArray(list) || !list.length) throw new Error(`watch-plan/rules : ${key} incomplet.`);
    list.forEach(item => text(item, `rules/${key}`));
  }
  if (!Array.isArray(rules.evaluation) || !rules.evaluation.length) throw new Error('watch-plan/rules : évaluation manquante.');
  for (const item of rules.evaluation) {
    const criterion = record(item, 'rules/evaluation');
    text(criterion.title, 'evaluation/title'); text(criterion.text, 'evaluation/text');
  }
  return rules as unknown as WatchRules;
}
