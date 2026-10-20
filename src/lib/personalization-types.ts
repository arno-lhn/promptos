import type { PromptOption } from './prompt-types.ts';

export const personalizationControls = {
  posture: 'select', behaviors: 'checkbox', disagreement: 'radio',
  tone: 'select', languageLevel: 'radio', responseLength: 'radio',
  presentation: 'checkbox', responseLanguage: 'select',
  clarification: 'radio', explanationMethods: 'checkbox', workApproach: 'select', initiative: 'radio',
  uncertainty: 'checkbox', sources: 'checkbox', verification: 'radio',
  digitalLevel: 'radio', avoidElements: 'checkbox',
  usageContext: 'textarea', extraPreferences: 'textarea', extraAvoid: 'textarea',
} as const;
export type PersonalizationFieldId = keyof typeof personalizationControls;
export type PersonalizationState = {
  [K in PersonalizationFieldId]: typeof personalizationControls[K] extends 'checkbox' ? string[] : string;
};
export type PersonalizationCatalogId = Exclude<PersonalizationFieldId, 'usageContext' | 'extraPreferences' | 'extraAvoid'>;
export type PersonalizationCatalogs = Record<PersonalizationCatalogId, PromptOption[]>;
export const personalizationCatalogFiles: Record<PersonalizationCatalogId, string> = {
  posture: 'postures', behaviors: 'behaviors', disagreement: 'disagreements',
  tone: 'tones', languageLevel: 'language-levels', responseLength: 'response-lengths',
  presentation: 'presentation-preferences', responseLanguage: 'response-languages',
  clarification: 'clarification-strategies', explanationMethods: 'explanation-methods',
  workApproach: 'work-approaches', initiative: 'initiative-levels', uncertainty: 'uncertainty-rules',
  sources: 'source-preferences', verification: 'verification-strategies', digitalLevel: 'digital-levels', avoidElements: 'avoid-elements',
};
export interface PersonalizationField {
  id: PersonalizationFieldId;
  label: string;
  type: 'select' | 'radio' | 'checkbox' | 'textarea';
  help: string;
  catalog?: string;
  placeholder?: string;
  promptPrefix?: string;
  layout?: 'list';
}
export interface PersonalizationSection {
  id: string;
  title: string;
  promptTitle: string;
  description: string;
  note?: string;
  fields: PersonalizationField[];
}
export function createEmptyPersonalizationState(): PersonalizationState {
  return {
    posture: '', behaviors: [], disagreement: '', tone: '', languageLevel: '',
    responseLength: '', presentation: [], responseLanguage: '', clarification: '',
    explanationMethods: [], workApproach: '', initiative: '', uncertainty: [],
    sources: [], verification: '', digitalLevel: '', avoidElements: [],
    usageContext: '', extraPreferences: '', extraAvoid: '',
  };
}
