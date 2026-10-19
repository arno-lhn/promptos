import roles from "../../public/data/roles.json" with { type: "json" };
import postures from "../../public/data/postures.json" with { type: "json" };
import intentions from "../../public/data/intentions.json" with { type: "json" };
import tasks from "../../public/data/tasks.json" with { type: "json" };
import contexts from "../../public/data/contexts.json" with { type: "json" };
import knowledge from "../../public/data/knowledge-levels.json" with { type: "json" };
import sources from "../../public/data/source-requirements.json" with { type: "json" };
import audiences from "../../public/data/target-audiences.json" with { type: "json" };
import domains from "../../public/data/domains.json" with { type: "json" };
import operational from "../../public/data/operational-contexts.json" with { type: "json" };
import avoid from "../../public/data/avoid-elements.json" with { type: "json" };
import tones from "../../public/data/tones.json" with { type: "json" };
import styles from "../../public/data/writing-styles.json" with { type: "json" };
import formats from "../../public/data/output-formats.json" with { type: "json" };
import help from "../../public/data/field-help.json" with { type: "json" };
import { validateCatalog, validateSections } from "./validation.ts";
import type { CatalogId, Catalogs } from "./prompt-types.ts";

const raw = {
  role: roles,
  posture: postures,
  intention: intentions,
  task: tasks,
  context: contexts,
  knowledgeLevel: knowledge,
  sourceRequirements: sources,
  targetAudience: audiences,
  domains,
  operationalContext: operational,
  avoidElements: avoid,
  tone: tones,
  writingStyle: styles,
  outputFormat: formats,
};

// Validation during static compilation: a bad catalogue fails the build with its name.
export const catalogs = Object.fromEntries(
  Object.entries(raw).map(([key, value]) => [
    key,
    validateCatalog(value, key).filter((option) => option.active),
  ]),
) as Catalogs;
export const sections = validateSections(help);
export function getOptions(id: string) {
  return Object.hasOwn(catalogs, id) ? catalogs[id as CatalogId] : [];
}
