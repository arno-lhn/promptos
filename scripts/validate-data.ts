import { catalogs, sections } from "../src/lib/data-loader.ts";
import { personalizationCatalogs, personalizationSections } from '../src/lib/personalization-data.ts';
import { validateExamples } from '../src/lib/examples.ts';
import { readdirSync, readFileSync } from 'node:fs';
console.log(
  `Données valides : ${Object.keys(catalogs).length} catalogues, ${Object.values(catalogs).flat().length} options actives, ${sections.flatMap((section) => section.fields).length} champs documentés.`,
);
console.log(`Personnalisation : ${Object.keys(personalizationCatalogs).length} catalogues, ${Object.values(personalizationCatalogs).flat().filter(option => option.active).length} options actives, ${personalizationSections.flatMap(section => section.fields).length} champs.`);
const directory = new URL('../src/data/examples/', import.meta.url);
const examples = validateExamples(readdirSync(directory).filter(file => file.endsWith('.json') && file !== 'categories.json').map(file => JSON.parse(readFileSync(new URL(file, directory), 'utf8'))));
console.log(`Exemples : ${examples.filter(example => example.active).length} fiches actives validées.`);
