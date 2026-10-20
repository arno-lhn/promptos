import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { exampleCategories, filterExamples, validateCategories, validateExamples } from '../src/lib/examples.ts';
const directory = new URL('../src/data/examples/', import.meta.url);
const raw = readdirSync(directory).filter(file => file.endsWith('.json') && file !== 'categories.json').map(file => JSON.parse(readFileSync(new URL(file, directory), 'utf8')));
const examples = validateExamples(raw);

test('la bibliothèque contient douze cas complets et huit catégories', () => {
  assert.equal(examples.length, 12); assert.equal(exampleCategories.length, 8);
  assert.equal(new Set(examples.map(example => example.id)).size, 12);
  assert.equal(new Set(examples.map(example => example.slug)).size, 12);
  assert.deepEqual(examples.map(example => example.order), Array.from({ length: 12 }, (_, i) => i + 1));
  for (const example of examples) {
    assert.ok(example.prompt.split(/\s+/).length >= 90, example.id);
    assert.ok(example.explanation.length >= 3); assert.ok(example.adaptations.length >= 3 && example.adaptations.length <= 5);
    assert.ok(exampleCategories.some(category => category.id === example.category));
  }
});
test('la recherche couvre titre, description et mots-clés sans distinguer accents ou casse', () => {
  assert.equal(filterExamples(examples, 'REFORMULER')[0].id, 'reformulation-accessible');
  assert.ok(filterExamples(examples, 'diapositives').some(example => example.id === 'presentation-gamma'));
  assert.ok(filterExamples(examples, 'courriel').some(example => example.id === 'email-professionnel'));
  assert.ok(filterExamples(examples, 'evaluation').some(example => example.id === 'exercice-pedagogique'));
});
test('les mots de recherche et la catégorie se combinent', () => {
  assert.equal(filterExamples(examples, '', 'formation').length, 2);
  assert.equal(filterExamples(examples, 'exercice pedagogique', 'formation').length, 1);
  assert.equal(filterExamples(examples, 'gamma', 'formation').length, 0);
});
test('état vide et réinitialisation logique des filtres', () => {
  assert.equal(filterExamples(examples, 'zzzz-introuvable').length, 0);
  assert.equal(filterExamples(examples, '', 'unknown').length, 0);
  assert.equal(filterExamples(examples, '  ', '').length, 12);
});
test('les fiches inactives sont exclues', () => {
  assert.equal(filterExamples(examples.map(example => ({ ...example, active: false }))).length, 0);
});
test('les variables sont toutes expliquées et les contenus ne changent pas pendant la recherche', () => {
  const copy = structuredClone(examples); filterExamples(examples, 'formation'); assert.deepEqual(examples, copy);
  for (const example of examples) for (const match of example.prompt.matchAll(/\[([^\]\n]+)\]/g)) assert.ok(example.variables.some(variable => variable.name === match[1]));
});
test('les identifiants, slugs et ordres doivent être uniques', () => {
  assert.throws(() => validateExamples([examples[0], examples[0]]), /dupliqué/);
  assert.throws(() => validateExamples([{ ...examples[0], slug: '../sortie' }]), /slug/);
  assert.throws(() => validateExamples([{ ...examples[0], order: 0 }]), /ordre/);
});
test('les données incomplètes ou les catégories inconnues sont rejetées', () => {
  for (const key of ['title', 'description', 'need', 'prompt']) assert.throws(() => validateExamples([{ ...examples[0], [key]: '' }]), /texte non vide/);
  assert.throws(() => validateExamples([{ ...examples[0], category: 'inconnue' }]), /catégorie/);
  assert.throws(() => validateExamples([{ ...examples[0], active: 'oui' }]), /booléen/);
  assert.throws(() => validateExamples([{ ...examples[0], adaptations: [] }]), /incomplète/);
  assert.throws(() => validateExamples([{ ...examples[0], explanation: [] }]), /explications/);
  assert.throws(() => validateExamples([{ ...examples[0], variables: [] }]), /variable non expliquée/);
  assert.throws(() => validateCategories([exampleCategories[0], exampleCategories[0]]), /dupliqué/);
});
