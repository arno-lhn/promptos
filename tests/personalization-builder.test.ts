import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonalization, isPersonalizationStale } from '../src/lib/personalization-builder.ts';
import { personalizationCatalogs as catalogs, personalizationSections as sections } from '../src/lib/personalization-data.ts';
import { createEmptyPersonalizationState as empty, type PersonalizationCatalogId, type PersonalizationFieldId, personalizationControls } from '../src/lib/personalization-types.ts';
import { validatePersonalizationSections } from '../src/lib/personalization-validation.ts';
import { validateCatalog } from '../src/lib/validation.ts';

test('personnalisation : formulaire vide et espaces seuls', () => {
  assert.equal(buildPersonalization(empty()), '');
  assert.equal(buildPersonalization({ ...empty(), usageContext: ' \r\n\t ', extraPreferences: ' ' }), '');
});
test('un seul choix suffit, sans préférence ajoutée', () => {
  assert.equal(buildPersonalization({ ...empty(), posture: 'kind' }), '# COMPORTEMENT\n\nAdopte une posture bienveillante et respectueuse.');
});
for (const id of ['usageContext', 'extraPreferences', 'extraAvoid'] as const) {
  test(`le texte libre ${id} suffit et conserve les mots`, () => {
    const text = 'MES mots  avec deux espaces.\n\n<Texte non interprété> !';
    const result = buildPersonalization({ ...empty(), [id]: ` \r\n${text}\r\n ` });
    assert.ok(result.startsWith('# MES PRÉFÉRENCES\n\n'));
    assert.ok(result.endsWith(text));
    assert.equal((result.match(/^# /gm) ?? []).length, 1);
  });
}
test('les retours CR et CRLF sont normalisés sans réécriture', () => {
  assert.ok(buildPersonalization({ ...empty(), usageContext: ' un\rdeux\r\ntrois ' }).endsWith('un\ndeux\ntrois'));
});
test('les sélections multiples suivent le catalogue, indépendamment des clics', () => {
  const a = buildPersonalization({ ...empty(), behaviors: ['errors', 'patient'] });
  assert.equal(a, buildPersonalization({ ...empty(), behaviors: ['patient', 'errors'] }));
  assert.ok(a.indexOf(catalogs.behaviors[0].promptText) < a.indexOf(catalogs.behaviors[3].promptText));
});
test('les sections vides disparaissent et les autres conservent leur ordre', () => {
  const output = buildPersonalization({ ...empty(), posture: 'kind', sources: ['cite'], extraPreferences: 'Ma préférence' });
  assert.deepEqual(output.match(/^# .+$/gm), ['# COMPORTEMENT', '# FIABILITÉ', '# MES PRÉFÉRENCES']);
});
test('les champs et les options suivent un ordre stable', () => {
  const output = buildPersonalization({ ...empty(), posture: 'kind', behaviors: ['patient'], disagreement: 'clear' });
  assert.ok(output.indexOf(catalogs.posture[0].promptText) < output.indexOf(catalogs.behaviors[0].promptText));
  assert.ok(output.indexOf(catalogs.behaviors[0].promptText) < output.indexOf(catalogs.disagreement[0].promptText));
});
test('chaque option active peut générer seule, sans intitulé d’interface concaténé', () => {
  for (const [id, options] of Object.entries(catalogs)) for (const option of options) {
    const value = personalizationControls[id as PersonalizationCatalogId] === 'checkbox' ? [option.id] : option.id;
    const output = buildPersonalization({ ...empty(), [id]: value });
    assert.ok(output.includes(option.promptText), `${id}/${option.id}`);
    assert.equal(output.split('\n\n').at(-1), option.promptText);
  }
});
test('les options inconnues sont ignorées', () => {
  assert.equal(buildPersonalization({ ...empty(), posture: 'unknown', behaviors: ['unknown'], responseLanguage: '__proto__' }), '');
});
test('les options désactivées ne génèrent rien', () => {
  const disabled = { ...catalogs, posture: catalogs.posture.map(option => ({ ...option, active: false })) };
  assert.equal(buildPersonalization({ ...empty(), posture: 'kind' }, disabled), '');
});
test('les identifiants répétés ne dupliquent pas les instructions', () => {
  assert.equal(buildPersonalization({ ...empty(), behaviors: ['patient', 'patient'] }), buildPersonalization({ ...empty(), behaviors: ['patient'] }));
});
test('les formulations strictement identiques ne sont émises qu’une fois', () => {
  const duplicate = { ...catalogs, tone: [{ ...catalogs.tone[0], promptText: catalogs.posture[0].promptText }] };
  const output = buildPersonalization({ ...empty(), posture: 'kind', tone: 'professional' }, duplicate);
  assert.equal(output, '# COMPORTEMENT\n\n' + catalogs.posture[0].promptText);
});
test('deux états identiques donnent le même résultat sans mutation', () => {
  const state = { ...empty(), tone: 'professional', usageContext: 'Mon contexte', behaviors: ['patient', 'errors'] };
  const before = structuredClone(state);
  assert.equal(buildPersonalization(state), buildPersonalization(structuredClone(state)));
  assert.deepEqual(state, before);
});
test('une modification et la suppression de tous les choix rendent le résultat obsolète', () => {
  const state = { ...empty(), posture: 'kind' }, result = buildPersonalization(state);
  assert.equal(isPersonalizationStale(state, result), false);
  state.posture = 'neutral'; assert.equal(isPersonalizationStale(state, result), true);
  state.posture = ''; assert.equal(isPersonalizationStale(state, result), true);
  assert.equal(isPersonalizationStale(state, ''), false);
});
test('régénérer ou revenir aux choix initiaux retire l’obsolescence', () => {
  const state = { ...empty(), posture: 'kind' }, result = buildPersonalization(state);
  state.posture = 'neutral'; assert.equal(isPersonalizationStale(state, buildPersonalization(state)), false);
  state.posture = 'kind'; assert.equal(isPersonalizationStale(state, result), false);
});
test('réinitialiser crée un état neuf sans tableaux partagés', () => {
  const first = empty(), reset = empty(); first.behaviors.push('patient'); first.extraAvoid = 'À éviter';
  assert.deepEqual(reset, empty()); assert.equal(buildPersonalization(reset), '');
  assert.notEqual(first.behaviors, reset.behaviors);
});
test('les préférences détaillées et la limitation de la longueur inutile sont compatibles', () => {
  const output = buildPersonalization({ ...empty(), responseLength: 'detailed', avoidElements: ['verbosity'], presentation: ['summary'], initiative: 'request-only' });
  for (const text of [catalogs.responseLength[3].promptText, catalogs.avoidElements[1].promptText, catalogs.presentation[7].promptText, catalogs.initiative[0].promptText]) assert.ok(output.includes(text));
});
test('toutes les combinaisons de choix exclusifs sont stables', () => {
  for (const tone of catalogs.tone) for (const length of catalogs.responseLength) {
    const state = { ...empty(), tone: tone.id, responseLength: length.id };
    const output = buildPersonalization(state);
    assert.ok(output.includes(tone.promptText)); assert.ok(output.includes(length.promptText));
    assert.equal(output, buildPersonalization(state));
  }
});
test('un formulaire complet produit les cinq sections dans l’ordre', () => {
  const state = empty();
  for (const [id, type] of Object.entries(personalizationControls)) {
    const field = id as PersonalizationFieldId;
    const options = catalogs[field as PersonalizationCatalogId];
    Object.assign(state, { [field]: type === 'textarea' ? 'Texte libre' : type === 'checkbox' ? options.map(option => option.id) : options[0].id });
  }
  assert.deepEqual(buildPersonalization(state).match(/^# .+$/gm), sections.map(section => '# ' + section.promptTitle));
});
test('les 104 options, 17 catalogues et 20 champs sont documentés sans choix par défaut', () => {
  assert.equal(Object.values(catalogs).flat().length, 104); assert.equal(Object.keys(catalogs).length, 17);
  assert.equal(sections.flatMap(section => section.fields).length, 20);
  assert.ok(Object.values(empty()).every(value => Array.isArray(value) ? !value.length : value === ''));
  assert.equal(validatePersonalizationSections(sections, catalogs).length, 5);
});
test('la validation refuse sections, champs, types ou catalogues invalides', () => {
  assert.throws(() => validatePersonalizationSections([], catalogs), /cinq/);
  const missing = structuredClone(sections); missing[0].fields.pop(); assert.throws(() => validatePersonalizationSections(missing, catalogs), /manquants/);
  const duplicate = structuredClone(sections); duplicate[1].fields.push(duplicate[0].fields[0]); assert.throws(() => validatePersonalizationSections(duplicate, catalogs), /dupliqué/);
  const type = structuredClone(sections); type[0].fields[0].type = 'checkbox'; assert.throws(() => validatePersonalizationSections(type, catalogs), /type/);
  const catalog = structuredClone(sections); catalog[0].fields[0].catalog = 'unknown'; assert.throws(() => validatePersonalizationSections(catalog, catalogs), /catalogue/);
  const help = structuredClone(sections); help[0].fields[0].help = ''; assert.throws(() => validatePersonalizationSections(help, catalogs), /help/);
  assert.throws(() => validatePersonalizationSections(sections, { ...catalogs, unknown: [] }), /correspondance/);
});
test('la validation contrôle les formulations, identifiants et booléens des catalogues', () => {
  const first = catalogs.posture[0];
  assert.throws(() => validateCatalog([{ ...first, promptText: '' }], 'personalization/postures'), /texte non vide/);
  assert.throws(() => validateCatalog([first, first], 'personalization/postures'), /dupliqué/);
  assert.throws(() => validateCatalog([{ ...first, active: 'oui' }], 'personalization/postures'), /booléen/);
  assert.throws(() => validatePersonalizationSections(sections, { ...catalogs, posture: [{ ...first, promptText: '' }] }), /postures/);
});
