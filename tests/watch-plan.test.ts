import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWatchPrompt, isWatchPromptStale } from '../src/lib/watch-plan-builder.ts';
import { watchCatalogs as catalogs, watchRules as rules, watchSections as sections } from '../src/lib/watch-plan-data.ts';
import { createEmptyWatchState as empty, watchControls, type WatchCatalogId, type WatchFieldId } from '../src/lib/watch-plan-types.ts';
import { validateWatchCatalogs, validateWatchRules, validateWatchSections } from '../src/lib/watch-plan-validation.ts';

test('veille : les règles communes ne permettent pas de générer un formulaire vide', () => {
  assert.equal(buildWatchPrompt(empty()), '');
  assert.equal(buildWatchPrompt({ ...empty(), topic: ' \r\n\t ', constraints: ' ' }), '');
  assert.ok(Object.values(empty()).every(value => Array.isArray(value) ? !value.length : value === ''));
});
for (const id of Object.keys(watchControls).filter(id => watchControls[id as WatchFieldId] === 'textarea') as WatchFieldId[]) {
  test(`veille : le champ libre ${id} peut générer seul, sans reformulation`, () => {
    const original = 'MES mots  restent exacts.\r\n\rUne ligne <texte>.';
    const output = buildWatchPrompt({ ...empty(), [id]: '  ' + original + '  ' });
    assert.ok(output.includes('MES mots  restent exacts.\n\nUne ligne <texte>.'));
    assert.equal((output.match(/^## /gm) ?? []).length, 1);
    assert.ok(output.includes(rules.introduction));
  });
}
test('veille : chaque option peut générer seule, avec sa formulation et la méthode', () => {
  for (const [id, options] of Object.entries(catalogs)) for (const option of options) {
    const output = buildWatchPrompt({ ...empty(), [id]: watchControls[id as WatchCatalogId] === 'checkbox' ? [option.id] : option.id });
    assert.ok(output.includes(option.promptText), `${id}/${option.id}`);
    assert.ok(output.includes('# PLAN DE VEILLE ATTENDU'));
    assert.ok(rules.methodology.every(text => output.includes(text)));
  }
});
test('veille : aucun choix facultatif non sélectionné n’est ajouté', () => {
  const output = buildWatchPrompt({ ...empty(), topic: 'Mon sujet' });
  for (const options of Object.values(catalogs)) for (const option of options) assert.ok(!output.includes(option.promptText), option.id);
});
test('veille : les sections vides sont omises et les autres restent dans leur ordre', () => {
  const output = buildWatchPrompt({ ...empty(), topic: 'Mon sujet', knownSources: 'Un organisme', frequency: 'weekly' });
  assert.deepEqual(output.match(/^## .+$/gm), ['## SUJET ET ACTIVITÉ', '## PÉRIMÈTRE ET REPÈRES', '## ORGANISATION DE LA VEILLE']);
});
test('veille : l’ordre du catalogue prime sur l’ordre des clics, sans doublon', () => {
  const output = buildWatchPrompt({ ...empty(), goals: ['decide', 'updates', 'decide'] });
  assert.equal(output, buildWatchPrompt({ ...empty(), goals: ['updates', 'decide'] }));
  assert.ok(output.indexOf(catalogs.goals[0].promptText) < output.indexOf(catalogs.goals[3].promptText));
});
test('veille : des formulations strictement identiques ne sont pas répétées', () => {
  const data = { ...catalogs, goals: catalogs.goals.map(option => ({ ...option, promptText: catalogs.watchType[0].promptText })) };
  const output = buildWatchPrompt({ ...empty(), watchType: 'regulatory', goals: ['updates', 'decide'] }, data);
  assert.equal(output.split(catalogs.watchType[0].promptText).length - 1, 1);
});
test('veille : les options inconnues et désactivées sont ignorées', () => {
  assert.equal(buildWatchPrompt({ ...empty(), watchType: '__proto__', goals: ['unknown'] }), '');
  const data = { ...catalogs, watchType: catalogs.watchType.map(option => ({ ...option, active: false })) };
  assert.equal(buildWatchPrompt({ ...empty(), watchType: 'regulatory' }, data), '');
});
test('veille : la génération est déterministe et ne modifie pas le formulaire', () => {
  const state = { ...empty(), topic: 'La paie', territory: 'France', goals: ['practice', 'updates'] };
  const before = structuredClone(state);
  assert.equal(buildWatchPrompt(state), buildWatchPrompt(structuredClone(state)));
  assert.deepEqual(state, before);
});
test('veille : le mode sans accès au Web et les sources non consultées sont prévus', () => {
  const output = buildWatchPrompt({ ...empty(), topic: 'Mon sujet' });
  for (const phrase of ['Si tu ne peux pas rechercher ou ouvrir une source', 'Ne présente aucune piste non consultée comme une source vérifiée', 'N’invente aucun lien', 'non consultée — à vérifier', 'date réelle de consultation']) assert.ok(output.includes(phrase), phrase);
});
test('veille : la découverte complète les sources connues sans leur accorder une confiance automatique', () => {
  const output = buildWatchPrompt({ ...empty(), knownSources: 'https://exemple.test/reference', discovery: 'extend' });
  for (const phrase of ['https://exemple.test/reference', 'source connue', 'nouvelle source', 'examine les sources déjà indiquées', 'sources nouvelles, complémentaires et diversifiées']) assert.ok(output.includes(phrase), phrase);
});
test('veille : pertinence et fiabilité sont distinguées et doivent être justifiées', () => {
  const output = buildWatchPrompt({ ...empty(), topic: 'Mon sujet' });
  for (const phrase of ['« forte », « moyenne », « faible » ou « non évaluable »', 'Justifie ce premier niveau de pertinence', 'Évalue séparément les indices de fiabilité', 'Une forte pertinence ne prouve pas la fiabilité', 'classement est provisoire']) assert.ok(output.includes(phrase), phrase);
});
test('veille : les références et chaque information importante doivent être traçables', () => {
  const output = buildWatchPrompt({ ...empty(), topic: 'Mon sujet' });
  for (const phrase of ['URL directe', 'titre exact', 'l’auteur ou l’organisme éditeur', 'dates de publication', 'place sa référence à proximité de l’affirmation', 'document utilisé comme preuve']) assert.ok(output.includes(phrase), phrase);
});
test('veille : le cadre juridique reste conditionnel, daté et territorialisé', () => {
  const output = buildWatchPrompt({ ...empty(), watchType: 'regulatory' });
  for (const phrase of ['dimension réglementaire ou juridique', 'territoire et le cadre applicable', 'textes en vigueur, les projets et les annonces', 'entrée en vigueur', 'N’affirme pas l’applicabilité d’un texte non vérifié']) assert.ok(output.includes(phrase), phrase);
  assert.ok(!output.includes('France'));
});
test('veille : sujet manquant et organisation non renseignée restent à préciser', () => {
  const output = buildWatchPrompt({ ...empty(), frequency: 'weekly' });
  assert.ok(output.includes('pose jusqu’à trois questions ciblées'));
  assert.ok(output.includes('Ne choisis pas un secteur ou un pays à ma place'));
  assert.ok(output.includes('propose des options explicites à valider'));
});
test('veille : le résultat prévoit un plan opérationnel et non une simple liste de liens', () => {
  const output = buildWatchPrompt({ ...empty(), topic: 'Mon sujet' });
  for (const phrase of ['stratégie de recherche', 'registre des sources', 'grille d’évaluation', 'plan opérationnel', 'budget de temps', 'qui valide', 'réévaluation des sources', 'Ne prétends pas créer des alertes']) assert.ok(output.includes(phrase), phrase);
});
test('veille : une modification rend le résultat obsolète et une régénération l’actualise', () => {
  const state = { ...empty(), topic: 'Un sujet' }, result = buildWatchPrompt(state);
  assert.equal(isWatchPromptStale(state, result), false);
  state.topic = 'Autre sujet'; assert.equal(isWatchPromptStale(state, result), true);
  assert.equal(isWatchPromptStale(state, buildWatchPrompt(state)), false);
  state.topic = 'Un sujet'; assert.equal(isWatchPromptStale(state, result), false);
  state.topic = ''; assert.equal(isWatchPromptStale(state, result), true);
  assert.equal(isWatchPromptStale(state, ''), false);
});
test('veille : la réinitialisation crée des tableaux indépendants et un résultat vide', () => {
  const first = empty(), reset = empty(); first.goals.push('updates'); first.topic = 'Un sujet';
  assert.deepEqual(reset, empty()); assert.notEqual(first.goals, reset.goals);
  assert.equal(buildWatchPrompt(reset), '');
});
test('veille : toutes les sections sont produites lorsque chaque champ est renseigné', () => {
  const state = empty();
  for (const [id, type] of Object.entries(watchControls)) {
    const options = catalogs[id as WatchCatalogId];
    Object.assign(state, { [id]: type === 'textarea' ? 'Mon texte' : type === 'checkbox' ? options.map(option => option.id) : options[0].id });
  }
  assert.deepEqual(buildWatchPrompt(state).match(/^## .+$/gm), sections.map(section => '## ' + section.promptTitle));
  assert.equal(Object.values(catalogs).flat().length, 48);
  assert.equal(sections.flatMap(section => section.fields).length, 18);
});
test('veille : validation des catalogues, contrôles, aides et règles communes', () => {
  assert.throws(() => validateWatchCatalogs({}), /correspondance/);
  assert.throws(() => validateWatchCatalogs({ ...catalogs, watchType: [catalogs.watchType[0], catalogs.watchType[0]] }), /dupliqué/);
  assert.throws(() => validateWatchCatalogs({ ...catalogs, frequency: [{ ...catalogs.frequency[0], promptText: '' }] }), /texte non vide/);
  assert.throws(() => validateWatchSections([]), /cinq/);
  const missing = structuredClone(sections); missing[0].fields.pop(); assert.throws(() => validateWatchSections(missing), /manquants/);
  const duplicate = structuredClone(sections); duplicate[1].fields.push(duplicate[0].fields[0]); assert.throws(() => validateWatchSections(duplicate), /dupliqué/);
  const invalid = structuredClone(sections); invalid[0].fields[0].type = 'radio'; assert.throws(() => validateWatchSections(invalid), /type/);
  const help = structuredClone(sections); help[0].fields[0].help = ''; assert.throws(() => validateWatchSections(help), /texte non vide/);
  const prefix = structuredClone(sections); prefix[0].fields[0].promptPrefix = ''; assert.throws(() => validateWatchSections(prefix), /promptPrefix/);
  assert.throws(() => validateWatchRules({ ...rules, methodology: [] }), /methodology incomplet/);
  assert.throws(() => validateWatchRules({ ...rules, evaluation: [] }), /évaluation manquante/);
  assert.throws(() => validateWatchRules({ ...rules, introduction: '' }), /introduction/);
  assert.equal(validateWatchCatalogs(catalogs).watchType.length, 6);
  assert.equal(validateWatchSections(sections).length, 5);
});
