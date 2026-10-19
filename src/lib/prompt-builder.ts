import { catalogs, sections } from "./data-loader.ts";
import type {
  CatalogId,
  Catalogs,
  FieldId,
  FormState,
} from "./prompt-types.ts";

export function normalizeText(text: string): string {
  return text.replace(/\r\n?/g, "\n").trim();
}

export function joinFrench(items: string[]): string {
  return items.length < 2
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} et ${items.at(-1)}`;
}

const prefixes = {
  taskDetails: "Voici les précisions concernant ma demande :",
  audienceDetails: "Voici les précisions concernant le public destinataire :",
  operationalDetails: "Voici les précisions concernant son utilisation :",
};

export function buildPrompt(
  state: FormState,
  data: Catalogs = catalogs,
): string {
  function instruction(key: FieldId): string {
    const value = state[key];
    if (key in prefixes) {
      const text = typeof value === "string" ? normalizeText(value) : "";
      return text ? `${prefixes[key as keyof typeof prefixes]}\n\n${text}` : "";
    }
    const options = data[key as CatalogId] ?? [];
    // Catalogue order makes output independent of checkbox click order. Unknown IDs are ignored.
    const selected = options.filter(
      (option) =>
        option.active &&
        (Array.isArray(value)
          ? value.includes(option.id)
          : value === option.id),
    );
    const texts = [...new Set(selected.map((option) => option.promptText))];
    if (!texts.length) return "";
    if (key === "context")
      return `Cette demande s’inscrit dans ${joinFrench(texts)}.`;
    if (key === "domains")
      return `Le résultat doit s’inscrire dans le domaine ${joinFrench(texts)}.`;
    if (key === "avoidElements") return `Évite ${joinFrench(texts)}.`;
    return texts.join("\n");
  }
  return sections
    .map((section) => {
      const body = section.fields
        .map((field) => instruction(field.id))
        .filter(Boolean)
        .join("\n\n");
      return body ? `# ${section.promptTitle}\n\n${body}` : "";
    })
    .filter(Boolean)
    .join("\n\n\n");
}

export function isResultStale(state: FormState, generated: string): boolean {
  return Boolean(generated) && buildPrompt(state) !== generated;
}
