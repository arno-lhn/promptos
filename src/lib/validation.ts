import type { PromptOption, SectionDefinition } from "./prompt-types.ts";
import { createEmptyState } from "./prompt-types.ts";

export function validateCatalog(value: unknown, name: string): PromptOption[] {
  if (!Array.isArray(value))
    throw new Error(`${name} : le catalogue doit être un tableau.`);
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object")
      throw new Error(`${name}[${index}] : option invalide.`);
    for (const key of ["id", "label", "promptText"] as const) {
      if (typeof item[key] !== "string" || !item[key].trim()) {
        throw new Error(
          `${name}[${index}] : « ${key} » doit être un texte non vide.`,
        );
      }
    }
    if (seen.has(item.id))
      throw new Error(`${name} : identifiant dupliqué « ${item.id} ».`);
    seen.add(item.id);
    if (typeof item.active !== "boolean")
      throw new Error(`${name} : « active » doit être un booléen.`);
    if (
      item.description !== undefined &&
      typeof item.description !== "string"
    ) {
      throw new Error(`${name} : description invalide.`);
    }
  }
  return value as PromptOption[];
}

export function validateSections(value: unknown): SectionDefinition[] {
  if (!Array.isArray(value) || value.length !== 5)
    throw new Error("field-help.json : cinq blocs sont attendus.");
  const expected = createEmptyState();
  const fields = new Set<string>();
  const sections = new Set<string>();
  for (const section of value) {
    if (!section || typeof section !== "object")
      throw new Error("field-help.json : bloc invalide.");
    for (const key of ["id", "title", "promptTitle", "description"]) {
      if (typeof section[key] !== "string" || !section[key].trim())
        throw new Error(`field-help.json : ${key} manquant.`);
    }
    if (sections.has(section.id))
      throw new Error("field-help.json : bloc dupliqué.");
    sections.add(section.id);
    if (!Array.isArray(section.fields))
      throw new Error("field-help.json : champs invalides.");
    if (section.note !== undefined && typeof section.note !== "string")
      throw new Error("field-help.json : note invalide.");
    for (const field of section.fields) {
      if (
        !field ||
        typeof field !== "object" ||
        !Object.hasOwn(expected, field.id) ||
        fields.has(field.id)
      ) {
        throw new Error(
          "field-help.json : identifiant de champ inconnu ou dupliqué.",
        );
      }
      fields.add(field.id);
      for (const key of ["label", "help"]) {
        if (typeof field[key] !== "string" || !field[key].trim())
          throw new Error(
            `field-help.json : ${key} manquant pour ${field.id}.`,
          );
      }
      const type = Array.isArray(expected[field.id as keyof typeof expected])
        ? "checkbox"
        : ["taskDetails", "audienceDetails", "operationalDetails"].includes(
              field.id,
            )
          ? "textarea"
          : null;
      if (
        !["select", "radio", "checkbox", "textarea"].includes(field.type) ||
        (type && field.type !== type) ||
        (!type && !["select", "radio"].includes(field.type))
      )
        throw new Error(`field-help.json : type invalide pour ${field.id}.`);
      if (
        field.placeholder !== undefined &&
        typeof field.placeholder !== "string"
      )
        throw new Error("field-help.json : placeholder invalide.");
    }
  }
  if (fields.size !== Object.keys(expected).length)
    throw new Error("field-help.json : des champs sont manquants.");
  return value as SectionDefinition[];
}
