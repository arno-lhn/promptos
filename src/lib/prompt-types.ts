export interface PromptOption {
  id: string;
  label: string;
  promptText: string;
  description?: string;
  active: boolean;
}

export interface FormState {
  role: string;
  posture: string;
  intention: string;
  task: string;
  taskDetails: string;
  context: string[];
  knowledgeLevel: string;
  sourceRequirements: string[];
  targetAudience: string;
  audienceDetails: string;
  domains: string[];
  operationalContext: string;
  operationalDetails: string;
  avoidElements: string[];
  tone: string;
  writingStyle: string;
  outputFormat: string;
}

export type FieldId = keyof FormState;
export type CatalogId = Exclude<
  FieldId,
  "taskDetails" | "audienceDetails" | "operationalDetails"
>;
export type Catalogs = Record<CatalogId, PromptOption[]>;
export interface FieldDefinition {
  id: FieldId;
  label: string;
  type: "select" | "radio" | "checkbox" | "textarea";
  help: string;
  placeholder?: string;
}
export interface SectionDefinition {
  id: string;
  title: string;
  promptTitle: string;
  description: string;
  note?: string;
  fields: FieldDefinition[];
}

export function createEmptyState(): FormState {
  return {
    role: "",
    posture: "",
    intention: "",
    task: "",
    taskDetails: "",
    context: [],
    knowledgeLevel: "",
    sourceRequirements: [],
    targetAudience: "",
    audienceDetails: "",
    domains: [],
    operationalContext: "",
    operationalDetails: "",
    avoidElements: [],
    tone: "",
    writingStyle: "",
    outputFormat: "",
  };
}
