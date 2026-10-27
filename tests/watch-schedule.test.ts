import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyWatchState } from '../src/lib/watch-plan-types.ts';
import { buildWatchPrompt } from '../src/lib/watch-plan-builder.ts';
import { watchCatalogs } from '../src/lib/watch-plan-data.ts';
import {
  buildScheduledWatchInstructions as work, buildWatchScheduleRequest as request,
  createEmptyWatchSchedule, describeWatchSchedule, getWatchScheduleIssues,
  isValidTimeZone, validateWatchScheduleData, watchScheduleData as data,
} from '../src/lib/watch-schedule.ts';

const subject = () => ({ ...createEmptyWatchState(), topic: 'Évolutions du droit de la formation', territory: 'France' });
const research = () => ({ ...createEmptyWatchSchedule(), mode: 'research', cadence: 'weekly', weekday: 'monday', time: '08:30', timezone: 'Europe/Paris', window: '7d' });

test('planification : aucun calendrier ni mode présélectionné, aucun texte sans configuration', () => {
  const config = createEmptyWatchSchedule();
  assert.ok(Object.values(config).every(value => value === ''));
  assert.equal(work(subject(), config), '');
  assert.equal(request(subject(), config), '');
  assert.equal(describeWatchSchedule(config), '');
});
test('planification : le sujet est requis sans rendre obligatoire le formulaire initial', () => {
  const state = { ...createEmptyWatchState(), frequency: 'weekly' };
  assert.ok(buildWatchPrompt(state));
  assert.equal(request(state, research()), '');
  assert.match(getWatchScheduleIssues(state, research()).join(' '), /sujet/);
});
test('planification : une configuration incomplète ou inconnue ne produit pas de demande', () => {
  for (const field of ['mode', 'cadence', 'weekday', 'time', 'timezone', 'window'] as const) {
    for (const value of ['', 'unknown']) assert.equal(request(subject(), { ...research(), [field]: value }), '', field);
  }
});
test('planification : les quatre cadences et les sept jours produisent un calendrier explicite', () => {
  for (const day of data.weekdays) {
    const text = request(subject(), { ...research(), weekday: day.id });
    assert.ok(text.includes(`Chaque ${day.label} à 08:30 (heure locale du fuseau Europe/Paris)`));
  }
  for (const cadence of ['daily', 'weekdays']) assert.ok(request(subject(), { ...research(), cadence, weekday: 'ignored', monthlyDay: 'ignored' }));
  for (const monthlyDay of ['1', '28']) assert.match(request(subject(), { ...research(), cadence: 'monthly', monthlyDay }), new RegExp(`Le ${monthlyDay} de chaque mois`));
  for (const monthlyDay of ['', '0', '29', '31', '01', '1.5']) assert.equal(request(subject(), { ...research(), cadence: 'monthly', monthlyDay }), '');
});
test('planification : heures locales strictes et fuseaux géographiques, sans décalage fixe implicite', () => {
  for (const time of ['00:00', '23:59']) assert.ok(request(subject(), { ...research(), time }));
  for (const time of ['8:30', '24:00', '12:60', '12:00Z', '']) assert.equal(request(subject(), { ...research(), time }), '');
  for (const zone of ['Europe/Paris', 'America/Montreal', 'UTC']) assert.ok(isValidTimeZone(zone));
  for (const zone of ['', 'Europe/Unknown', 'Paris', '+02:00', 'CET', ' Europe/Paris ']) assert.equal(isValidTimeZone(zone), false, zone);
  assert.match(request(subject(), research()), /Conserve l’heure locale du fuseau lors des changements d’heure/);
});
test('planification : calendrier réel pour la date de fin et contrôle de la prochaine occurrence demandé', () => {
  for (const endDate of ['2028-02-29', '2027-12-31']) assert.ok(request(subject(), { ...research(), endDate }).includes(endDate));
  for (const endDate of ['2026-02-29', '2027-04-31', '2027-13-01', '31/12/2027']) assert.equal(request(subject(), { ...research(), endDate }), '');
  assert.match(request(subject(), research()), /Aucune date de fin renseignée : fais confirmer/);
  assert.match(request(subject(), { ...research(), endDate: '2020-01-01' }), /Vérifie qu’une occurrence future est possible/);
});
test('planification : le travail est autonome et conserve les repères libres sans reformulation', () => {
  const state = { ...subject(), activity: '  MES mots\r\nrestent exacts.  ', knownSources: 'https://exemple.test/connue', keywords: 'mot A\nmot B', exclusions: 'Les rumeurs', constraints: 'Citer les articles pertinents.' };
  const output = work(state, { ...research(), approvedSources: '  Source retenue\r\nhttps://exemple.test/retenue  ' });
  for (const phrase of [state.topic, 'France', 'MES mots\nrestent exacts.', state.knownSources, state.keywords, state.exclusions, state.constraints, 'Source retenue\nhttps://exemple.test/retenue']) assert.ok(output.includes(phrase), phrase);
  assert.ok(!output.includes('\r'));
});
test('planification : la cadence et la mise en place du plan ne contaminent pas le travail récurrent', () => {
  const state = { ...subject(), frequency: 'weekly', timeBudget: 'two-hours', experience: 'beginner', channels: watchCatalogs.channels.map(option => option.id), discovery: watchCatalogs.discovery[0].id, outputFormat: watchCatalogs.outputFormat[0].id };
  const recurring = work(state, { ...research(), cadence: 'daily' });
  assert.equal(recurring, work(subject(), { ...research(), cadence: 'daily' }));
  assert.match(buildWatchPrompt(state), /Ne prétends pas créer des alertes/);
  assert.ok(!request(state, research()).includes('Ne prétends pas créer des alertes'));
});
test('planification : période recherchée indépendante du calendrier, historique jamais supposé', () => {
  for (const period of data.windows) assert.ok(work(subject(), { ...research(), window: period.id }).includes(period.instruction));
  const output = work(subject(), { ...research(), window: 'since-run' });
  assert.match(output, /31 derniers jours/);
  assert.match(output, /historique est réellement accessible/);
  assert.match(output, /nouveauté par rapport aux exécutions précédentes n’est pas vérifiée/);
});
test('planification : les limites de synthèse ne demandent jamais de remplir artificiellement', () => {
  for (const limit of ['3', '5', '10']) assert.match(work(subject(), { ...research(), limit }), new RegExp(`au maximum ${limit} informations pertinentes, sans remplir artificiellement`));
  assert.equal(work(subject(), { ...research(), limit: '100' }), '');
  assert.ok(!work(subject(), research()).includes('Présente au maximum'));
});
test('planification : recherche effective, références traçables et évaluation distincte de la fiabilité', () => {
  const output = work(subject(), research());
  for (const phrase of ['Recherche et ouvre effectivement', 'URL directe', 'date réelle de consultation', 'N’invente aucune référence', 'non évaluable — à vérifier', 'Examine séparément les indices de fiabilité', 'texte en vigueur, projet et annonce', 'Ne conclus pas à une conformité', 'sources complémentaires', 'absence limitée aux recherches effectuées']) assert.ok(output.includes(phrase), phrase);
});
test('planification : l’échec de recherche ne devient pas silencieusement un rappel', () => {
  assert.match(work(subject(), research()), /Ne remplace pas discrètement la recherche demandée par un simple rappel/);
  assert.match(request(subject(), research()), /S’ils ne sont pas disponibles, ne crée pas un rappel à la place/);
  assert.match(request(subject(), research()), /pendant les exécutions planifiées/);
});
test('planification : le rappel reste honnête et ignore les anciens réglages de recherche', () => {
  const config = { ...research(), mode: 'reminder', window: 'unknown', limit: 'unknown' };
  assert.equal(getWatchScheduleIssues(subject(), config).length, 0);
  const output = work(subject(), config);
  assert.match(output, /n’affirme pas avoir effectué une recherche/);
  assert.ok(!output.includes('PÉRIODE À EXAMINER'));
  assert.ok(!output.includes('RECHERCHE DE VEILLE RÉCURRENTE'));
  assert.ok(!output.includes('URL directe'));
  assert.match(request(subject(), config), /sans recherche Web ni synthèse de nouveautés/);
});
test('planification : demande d’accord puis action réelle et confirmation, sans doublon', () => {
  const output = request(subject(), research());
  for (const phrase of ['Attends ensuite mon accord explicite', 'crée effectivement la tâche', 'plutôt qu’un doublon', 'confirmation effective de l’outil ou de l’interface', 'mettre en pause ou supprimer', 'Ne crée aucune alerte ou tâche supplémentaire']) assert.ok(output.includes(phrase), phrase);
  assert.ok(output.indexOf('Attends ensuite mon accord explicite') < output.indexOf('crée effectivement la tâche'));
});
test('planification : les consignes enregistrées ne demandent pas de recréer la tâche à chaque exécution', () => {
  const task = work(subject(), research()), output = request(subject(), research());
  assert.ok(output.endsWith('# TRAVAIL À RÉPÉTER\n\n' + task));
  assert.match(output, /Enregistre uniquement la rubrique « TRAVAIL À RÉPÉTER »/);
  assert.ok(!task.includes('DEMANDE DE PLANIFICATION'));
  assert.ok(!task.includes('crée effectivement la tâche'));
  assert.match(task, /une seule exécution/);
  assert.match(task, /ne crée aucune planification depuis ces consignes de travail/);
});
test('planification : déterministe, sans mutation et sans création d’effets de bord', () => {
  const state = subject(), config = { ...research(), title: '  Ma veille\r\nformation  ' };
  const before = structuredClone({ state, config });
  assert.equal(request(state, config), request(structuredClone(state), structuredClone(config)));
  assert.deepEqual({ state, config }, before);
  assert.match(request(state, config), /Nom proposé : Ma veille\nformation/);
});
test('planification : catalogue incohérent bloqué à la validation', () => {
  assert.equal(validateWatchScheduleData(data), data);
  assert.throws(() => validateWatchScheduleData(null));
  for (const change of [
    { cadences: [] }, { modes: [data.modes[0], data.modes[0]] },
    { modes: [{ ...data.modes[0], help: '' }, data.modes[1]] },
    { windows: data.windows.map(option => ({ ...option, instruction: '' })) },
    { setupRules: [''] }, { researchRules: [] }, { reminderRules: null },
    { documentationUrl: 'https://exemple.test' }, { researchCapability: '' },
  ]) assert.throws(() => validateWatchScheduleData({ ...data, ...change }));
});
