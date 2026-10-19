import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPrompt,
  isResultStale,
  joinFrench,
  normalizeText,
} from "../src/lib/prompt-builder.ts";
import { catalogs, sections, getOptions } from "../src/lib/data-loader.ts";
import {
  createEmptyState,
  type CatalogId,
  type FormState,
} from "../src/lib/prompt-types.ts";
import { validateCatalog, validateSections } from "../src/lib/validation.ts";

test("un formulaire vide ou composé uniquement d’espaces ne produit rien", () => {
  const state = createEmptyState();
  assert.equal(buildPrompt(state), "");
  state.taskDetails = " \n\t  ";
  state.audienceDetails = "\r\n";
  state.operationalDetails = "  ";
  assert.equal(buildPrompt(state), "");
});

test("un rôle seul produit uniquement son titre et sa formulation", () => {
  assert.equal(
    buildPrompt({ ...createEmptyState(), role: "trainer" }),
    "# RÔLE ET POSTURE\n\nAdopte le rôle d’un formateur.",
  );
});

test("une tâche seule suffit, sans rôle ni contexte", () => {
  assert.equal(
    buildPrompt({ ...createEmptyState(), task: "email" }),
    "# CONTEXTE ET TÂCHE\n\nTa tâche consiste à rédiger un email.",
  );
});

for (const key of [
  "taskDetails",
  "audienceDetails",
  "operationalDetails",
] as const) {
  test(`le champ libre ${key} fonctionne seul et conserve les mots, la casse et les espaces internes`, () => {
    const text =
      'Mon texte  PERSONNEL.\n\nDeuxième ligne : <script>alert("test")</script> & « oui » !';
    const state = { ...createEmptyState(), [key]: `  ${text}\r\n ` };
    const prompt = buildPrompt(state);
    assert.ok(prompt.endsWith(text));
    assert.equal(prompt.match(/^# /gm)?.length, 1);
  });
}

test("la normalisation est limitée aux bords et aux retours à la ligne", () => {
  assert.equal(normalizeText("  A  B\r\n\rC \n "), "A  B\n\nC");
});

test("les listes françaises gèrent zéro, une, deux et plusieurs options", () => {
  assert.equal(joinFrench([]), "");
  assert.equal(joinFrench(["a"]), "a");
  assert.equal(joinFrench(["a", "b"]), "a et b");
  assert.equal(joinFrench(["a", "b", "c"]), "a, b et c");
});

test("les choix multiples sont assemblés dans l’ordre du catalogue, sans doublon", () => {
  const state = {
    ...createEmptyState(),
    context: ["training", "professional", "training"],
    domains: ["accounting", "hr"],
    avoidElements: ["off-topic", "jargon"],
  };
  const prompt = buildPrompt(state);
  assert.ok(
    prompt.includes(
      "Cette demande s’inscrit dans un contexte professionnel et un contexte de formation.",
    ),
  );
  assert.ok(
    prompt.includes(
      "Le résultat doit s’inscrire dans le domaine des ressources humaines et de la comptabilité.",
    ),
  );
  assert.ok(
    prompt.includes(
      "Évite le jargon technique non expliqué et les développements hors sujet.",
    ),
  );
  assert.equal(
    prompt,
    buildPrompt({
      ...state,
      context: ["professional", "training"],
      domains: ["hr", "accounting"],
    }),
  );
});

test("un bloc vide est absent et les blocs renseignés suivent un ordre stable", () => {
  const prompt = buildPrompt({
    ...createEmptyState(),
    role: "trainer",
    task: "email",
    operationalDetails: "Ma situation.",
    outputFormat: "email",
  });
  assert.deepEqual(prompt.match(/^# .+$/gm), [
    "# RÔLE ET POSTURE",
    "# CONTEXTE ET TÂCHE",
    "# CADRAGE OPÉRATIONNEL ET ÉLÉMENTS À ÉVITER",
    "# TON, STYLE ET FORMAT",
  ]);
  assert.ok(!prompt.includes("undefined"));
});

test("chaque champ prédéfini et chaque option peuvent générer seuls", () => {
  for (const [key, options] of Object.entries(catalogs)) {
    for (const option of options) {
      const initial = createEmptyState();
      const value = Array.isArray(initial[key as keyof FormState])
        ? [option.id]
        : option.id;
      const prompt = buildPrompt({ ...initial, [key]: value });
      assert.ok(prompt.includes(option.promptText), `${key} : ${option.id}`);
      assert.equal(prompt.match(/^# /gm)?.length, 1);
    }
  }
});

test("les six instructions de sources ne déclenchent pas d’accès réseau", () => {
  const state = {
    ...createEmptyState(),
    sourceRequirements: catalogs.sourceRequirements.map((option) => option.id),
  };
  const prompt = buildPrompt(state);
  for (const option of catalogs.sourceRequirements)
    assert.ok(prompt.includes(option.promptText));
});

test("les options inconnues ou désactivées sont ignorées", () => {
  assert.equal(
    buildPrompt({
      ...createEmptyState(),
      role: "unknown",
      context: ["unknown"],
    }),
    "",
  );
  const inactive = {
    ...catalogs,
    role: catalogs.role.map((option) => ({ ...option, active: false })),
  };
  assert.equal(
    buildPrompt({ ...createEmptyState(), role: "trainer" }, inactive),
    "",
  );
  assert.ok(
    Object.values(catalogs)
      .flat()
      .every((option) => option.active),
  );
  assert.deepEqual(getOptions("unknown"), []);
});

test("deux états identiques produisent exactement le même prompt", () => {
  const state = {
    ...createEmptyState(),
    role: "trainer",
    taskDetails: "Apprendre Sage.",
    tone: "professional",
  };
  assert.equal(buildPrompt(state), buildPrompt(structuredClone(state)));
});

test("une modification signale un résultat obsolète jusqu’à sa régénération", () => {
  const state = { ...createEmptyState(), role: "trainer" };
  const result = buildPrompt(state);
  assert.equal(isResultStale(state, result), false);
  state.role = "analyst";
  assert.equal(isResultStale(state, result), true);
  assert.equal(isResultStale(state, buildPrompt(state)), false);
  state.role = "";
  assert.equal(isResultStale(state, result), true);
  assert.equal(isResultStale(state, ""), false);
});

test("retour aux choix générés : le résultat correspond de nouveau au formulaire", () => {
  const state = { ...createEmptyState(), role: "trainer" };
  const result = buildPrompt(state);
  state.role = "analyst";
  state.role = "trainer";
  assert.equal(isResultStale(state, result), false);
});

test("une réinitialisation produit un état neuf, sans tableaux partagés", () => {
  const first = createEmptyState();
  first.context.push("professional");
  first.taskDetails = "Mon texte";
  const reset = createEmptyState();
  assert.equal(buildPrompt(reset), "");
  assert.deepEqual(reset.context, []);
  assert.notEqual(first.context, reset.context);
});

test("toutes les listes du cahier des charges sont renseignées", () => {
  const counts: Record<CatalogId, number> = {
    role: 23,
    posture: 8,
    intention: 12,
    task: 20,
    context: 12,
    knowledgeLevel: 3,
    sourceRequirements: 6,
    targetAudience: 20,
    domains: 18,
    operationalContext: 13,
    avoidElements: 14,
    tone: 14,
    writingStyle: 14,
    outputFormat: 18,
  };
  for (const key of Object.keys(counts) as CatalogId[])
    assert.equal(catalogs[key].length, counts[key], key);
  assert.equal(sections.flatMap((section) => section.fields).length, 17);
});

test("validation : tableaux, identifiants uniques, libellés, formulations et types", () => {
  const option = {
    id: "test",
    label: "Test",
    promptText: "Test.",
    active: true,
  };
  assert.deepEqual(validateCatalog([option], "test"), [option]);
  assert.throws(() => validateCatalog({}, "roles"), /roles/);
  assert.throws(() => validateCatalog([null], "roles"), /invalide/);
  assert.throws(() => validateCatalog([option, option], "roles"), /dupliqué/);
  for (const key of ["id", "label", "promptText"])
    assert.throws(
      () => validateCatalog([{ ...option, [key]: "" }], "roles"),
      /texte non vide/,
    );
  assert.throws(
    () => validateCatalog([{ ...option, active: "oui" }], "roles"),
    /booléen/,
  );
  assert.throws(
    () => validateCatalog([{ ...option, description: 42 }], "roles"),
    /description/,
  );
  assert.equal(
    validateCatalog([{ ...option, active: false }], "roles")[0].active,
    false,
  );
});

test("la configuration pédagogique doit définir exactement tous les champs", () => {
  assert.throws(() => validateSections([]), /cinq/);
  const missing = structuredClone(sections);
  missing[0].fields.pop();
  assert.throws(() => validateSections(missing), /manquants/);
  const duplicate = structuredClone(sections);
  duplicate[0].fields.push(duplicate[0].fields[0]);
  assert.throws(() => validateSections(duplicate), /dupliqué/);
  const invalid = structuredClone(sections);
  invalid[0].fields[0].help = "";
  assert.throws(() => validateSections(invalid), /help/);
});
