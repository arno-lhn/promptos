import catalogs from '../../public/data/watch-plan/catalogs.json' with { type: 'json' };
import sections from '../../public/data/watch-plan/field-help.json' with { type: 'json' };
import rules from '../../public/data/watch-plan/rules.json' with { type: 'json' };
import { validateWatchCatalogs, validateWatchRules, validateWatchSections } from './watch-plan-validation.ts';

export const watchCatalogs = validateWatchCatalogs(catalogs);
export const watchSections = validateWatchSections(sections);
export const watchRules = validateWatchRules(rules);
