import data from '../../public/data/watch-plan/scheduling.json' with { type: 'json' };
import { watchCatalogs, watchSections } from './watch-plan-data.ts';
import type { WatchCatalogId, WatchState } from './watch-plan-types.ts';

export interface WatchSchedule {
  mode: string;
  cadence: string;
  weekday: string;
  monthlyDay: string;
  time: string;
  timezone: string;
  window: string;
  endDate: string;
  approvedSources: string;
  limit: string;
  title: string;
}
export function createEmptyWatchSchedule(): WatchSchedule {
  return { mode: '', cadence: '', weekday: '', monthlyDay: '', time: '', timezone: '', window: '', endDate: '', approvedSources: '', limit: '', title: '' };
}
function nonempty(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}
export function validateWatchScheduleData(value: unknown): typeof data {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('watch-plan/scheduling.json : objet invalide.');
  const input = value as Record<string, unknown>;
  const expected: Record<string, string[]> = {
    modes: ['research', 'reminder'], cadences: ['daily', 'weekdays', 'weekly', 'monthly'],
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    windows: ['24h', '7d', '30d', 'since-run'], limits: ['3', '5', '10'],
  };
  for (const [key, ids] of Object.entries(expected)) {
    const list = input[key];
    if (!Array.isArray(list) || list.length !== ids.length) throw new Error(`scheduling/${key} : options invalides.`);
    const seen = new Set<string>();
    for (const item of list) {
      if (!item || typeof item !== 'object' || !ids.includes(item.id) || seen.has(item.id) || !nonempty(item.label)) throw new Error(`scheduling/${key} : option inconnue, dupliquée ou incomplète.`);
      if (key === 'modes' && !nonempty(item.help)) throw new Error('scheduling/modes : aide manquante.');
      if (key === 'windows' && !nonempty(item.instruction)) throw new Error('scheduling/windows : instruction manquante.');
      seen.add(item.id);
    }
  }
  for (const key of ['setupRules', 'researchRules', 'reminderRules']) {
    const list = input[key];
    if (!Array.isArray(list) || !list.length || !list.every(nonempty)) throw new Error(`scheduling/${key} : règles invalides.`);
  }
  if (!nonempty(input.researchCapability) || input.documentationUrl !== 'https://developers.openai.com/training/walkthroughs/scheduled-tasks') throw new Error('scheduling : capacité ou référence invalide.');
  return value as typeof data;
}
export const watchScheduleData = validateWatchScheduleData(data);
const normalize = (value: string) => value.replace(/\r\n?/g, '\n').trim();
const matches = (options: { id: string }[], value: string) => options.some(option => option.id === value);

export function isValidTimeZone(value: string): boolean {
  if (!/^(?:UTC|[A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+)+)$/.test(value)) return false;
  try { new Intl.DateTimeFormat('fr', { timeZone: value }); return true; } catch { return false; }
}
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function getWatchScheduleIssues(state: WatchState, config: WatchSchedule): string[] {
  const issues: string[] = [];
  if (!state.topic.trim()) issues.push('Précisez le sujet de votre veille dans la première section, puis régénérez votre demande.');
  if (!matches(data.modes, config.mode)) issues.push('Choisissez une recherche avec synthèse ou un simple rappel.');
  if (!matches(data.cadences, config.cadence)) issues.push('Choisissez la fréquence de la tâche.');
  if (config.cadence === 'weekly' && !matches(data.weekdays, config.weekday)) issues.push('Choisissez le jour de la semaine.');
  if (config.cadence === 'monthly' && !/^(?:[1-9]|1\d|2[0-8])$/.test(config.monthlyDay)) issues.push('Choisissez un jour du mois entre 1 et 28.');
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(config.time)) issues.push('Indiquez une heure locale valide.');
  if (!isValidTimeZone(config.timezone)) issues.push('Indiquez un fuseau reconnu, par exemple Europe/Paris.');
  if (config.mode === 'research' && !matches(data.windows, config.window)) issues.push('Choisissez la période à examiner à chaque recherche.');
  if (config.mode === 'research' && config.limit && !matches(data.limits, config.limit)) issues.push('Choisissez une limite de synthèse valide.');
  if (config.endDate && !validDate(config.endDate)) issues.push('Indiquez une date de fin valide ou laissez-la vide.');
  return issues;
}
export function describeWatchSchedule(config: WatchSchedule): string {
  if (!matches(data.cadences, config.cadence) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(config.time) || !isValidTimeZone(config.timezone)) return '';
  let cadence = data.cadences.find(option => option.id === config.cadence)!.label;
  if (config.cadence === 'weekly') {
    const day = data.weekdays.find(option => option.id === config.weekday);
    if (!day) return '';
    cadence = `Chaque ${day.label}`;
  }
  if (config.cadence === 'monthly') {
    if (!/^(?:[1-9]|1\d|2[0-8])$/.test(config.monthlyDay)) return '';
    cadence = `Le ${config.monthlyDay} de chaque mois`;
  }
  return `${cadence} à ${config.time} (heure locale du fuseau ${config.timezone}).`;
}
// Keep durable scope; the learner's session length and initial planning guidance are not job parameters.
function recurringContext(state: WatchState, reminder: boolean): string {
  const omitted = new Set(['frequency', 'timeBudget', 'channels', 'discovery', 'outputFormat', 'experience']);
  const reminderFields = new Set(['topic', 'activity', 'territory', 'keywords', 'knownSources', 'exclusions']);
  const seen = new Set<string>();
  return watchSections.flatMap(section => section.fields.flatMap(field => {
    if (omitted.has(field.id) || (reminder && !reminderFields.has(field.id))) return [];
    const value = state[field.id];
    if (field.type === 'textarea') {
      const text = typeof value === 'string' ? normalize(value) : '';
      return text ? [`${field.promptPrefix}\n${text}`] : [];
    }
    return (watchCatalogs[field.id as WatchCatalogId] ?? []).filter(option => option.active &&
      (Array.isArray(value) ? value.includes(option.id) : option.id === value),
    ).flatMap(option => {
      if (seen.has(option.promptText)) return [];
      seen.add(option.promptText);
      return [option.promptText];
    });
  })).join('\n\n');
}
export function buildScheduledWatchInstructions(state: WatchState, config: WatchSchedule): string {
  if (getWatchScheduleIssues(state, config).length) return '';
  const reminder = config.mode === 'reminder';
  const parts = [
    reminder ? '# RAPPEL DE VEILLE' : '# RECHERCHE DE VEILLE RÉCURRENTE',
    `## REPÈRES À CONSERVER À CHAQUE EXÉCUTION\n\n${recurringContext(state, reminder)}`,
  ];
  if (normalize(config.approvedSources)) parts.push(`## SOURCES RETENUES POUR LA TÂCHE, À VÉRIFIER LORS DE LEUR UTILISATION\n\n${normalize(config.approvedSources)}`);
  if (!reminder) {
    parts.push(`## PÉRIODE À EXAMINER\n\n${data.windows.find(option => option.id === config.window)!.instruction}`);
    if (config.limit) parts.push(`Présente au maximum ${config.limit} informations pertinentes, sans remplir artificiellement la synthèse si tu en trouves moins.`);
  }
  parts.push(`## TRAVAIL À EFFECTUER\n\n${(reminder ? data.reminderRules : data.researchRules).join('\n\n')}`);
  return parts.join('\n\n\n');
}
export function buildWatchScheduleRequest(state: WatchState, config: WatchSchedule): string {
  const task = buildScheduledWatchInstructions(state, config);
  if (!task) return '';
  const end = config.endDate ? `Date de fin demandée : ${config.endDate}, incluse dans le fuseau indiqué. Vérifie qu’une occurrence future est possible avant cette fin ; sinon demande une correction avant toute création.` : 'Aucune date de fin renseignée : fais confirmer ce point avant la création.';
  return [
    '# DEMANDE DE PLANIFICATION', data.setupRules.join('\n\n'),
    config.mode === 'research' ? data.researchCapability : 'Le mode choisi est un rappel, sans recherche Web ni synthèse de nouveautés.',
    `# CALENDRIER ET PARAMÈTRES DEMANDÉS\n\nNom proposé : ${normalize(config.title) || 'Ma veille récurrente'}\nMode : ${data.modes.find(option => option.id === config.mode)!.label}\n${describeWatchSchedule(config)}\n${end}\nConserve l’heure locale du fuseau lors des changements d’heure. Vérifie la prochaine occurrence dans l’outil, sans inventer de confirmation. Explique les canaux de notification disponibles et leurs réglages ; ne promets pas un envoi qui n’est pas configuré.`,
    '# TRAVAIL À RÉPÉTER\n\n' + task,
  ].join('\n\n\n');
}
