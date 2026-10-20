import postures from '../../public/data/personalization/postures.json' with { type: 'json' };
import behaviors from '../../public/data/personalization/behaviors.json' with { type: 'json' };
import disagreements from '../../public/data/personalization/disagreements.json' with { type: 'json' };
import tones from '../../public/data/personalization/tones.json' with { type: 'json' };
import languageLevels from '../../public/data/personalization/language-levels.json' with { type: 'json' };
import responseLengths from '../../public/data/personalization/response-lengths.json' with { type: 'json' };
import presentation from '../../public/data/personalization/presentation-preferences.json' with { type: 'json' };
import languages from '../../public/data/personalization/response-languages.json' with { type: 'json' };
import clarification from '../../public/data/personalization/clarification-strategies.json' with { type: 'json' };
import methods from '../../public/data/personalization/explanation-methods.json' with { type: 'json' };
import approaches from '../../public/data/personalization/work-approaches.json' with { type: 'json' };
import initiative from '../../public/data/personalization/initiative-levels.json' with { type: 'json' };
import uncertainty from '../../public/data/personalization/uncertainty-rules.json' with { type: 'json' };
import sources from '../../public/data/personalization/source-preferences.json' with { type: 'json' };
import verification from '../../public/data/personalization/verification-strategies.json' with { type: 'json' };
import digitalLevels from '../../public/data/personalization/digital-levels.json' with { type: 'json' };
import avoid from '../../public/data/personalization/avoid-elements.json' with { type: 'json' };
import help from '../../public/data/personalization/field-help.json' with { type: 'json' };
import { validatePersonalizationSections } from './personalization-validation.ts';
import type { PersonalizationCatalogs } from './personalization-types.ts';

export const personalizationCatalogs: PersonalizationCatalogs = {
  posture: postures, behaviors, disagreement: disagreements, tone: tones,
  languageLevel: languageLevels, responseLength: responseLengths,
  presentation, responseLanguage: languages, clarification,
  explanationMethods: methods, workApproach: approaches, initiative,
  uncertainty, sources, verification, digitalLevel: digitalLevels, avoidElements: avoid,
};
export const personalizationSections = validatePersonalizationSections(help, personalizationCatalogs);
