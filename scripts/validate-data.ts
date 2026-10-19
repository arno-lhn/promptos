import { catalogs, sections } from "../src/lib/data-loader.ts";
console.log(
  `Données valides : ${Object.keys(catalogs).length} catalogues, ${Object.values(catalogs).flat().length} options actives, ${sections.flatMap((section) => section.fields).length} champs documentés.`,
);
