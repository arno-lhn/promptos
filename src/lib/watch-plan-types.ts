import type { PromptOption } from './prompt-types.ts';

export const watchControls = {
  topic: 'textarea', activity: 'textarea', watchType: 'select', goals: 'checkbox',
  territory: 'textarea', keywords: 'textarea', knownSources: 'textarea', exclusions: 'textarea',
  sourceTypes: 'checkbox', discovery: 'radio', priorities: 'checkbox',
  frequency: 'select', timeBudget: 'select', channels: 'checkbox', audience: 'textarea',
  outputFormat: 'radio', experience: 'radio', constraints: 'textarea',
} as const;

export type WatchFieldId = keyof typeof watchControls;
export type WatchCatalogId = {
  [K in WatchFieldId]: typeof watchControls[K] extends 'textarea' ? never : K;
}[WatchFieldId];
export type WatchState = {
  [K in WatchFieldId]: typeof watchControls[K] extends 'checkbox' ? string[] : string;
};
export type WatchCatalogs = Record<WatchCatalogId, PromptOption[]>;
export interface WatchField {
  id: WatchFieldId;
  label: string;
  type: 'select' | 'radio' | 'checkbox' | 'textarea';
  help: string;
  placeholder?: string;
  promptPrefix?: string;
  layout?: 'list';
}
export interface WatchSection {
  id: string;
  title: string;
  promptTitle: string;
  description: string;
  fields: WatchField[];
}
export interface WatchRules {
  introduction: string;
  summary: string[];
  methodology: string[];
  expectedOutput: string[];
  evaluation: { title: string; text: string }[];
}
export function createEmptyWatchState(): WatchState {
  return {
    topic: '', activity: '', watchType: '', goals: [], territory: '', keywords: '',
    knownSources: '', exclusions: '', sourceTypes: [], discovery: '', priorities: [],
    frequency: '', timeBudget: '', channels: [], audience: '', outputFormat: '',
    experience: '', constraints: '',
  };
}
