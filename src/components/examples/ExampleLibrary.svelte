<script lang="ts">
  import { exampleCategories, filterExamples, type PromptExample } from '../../lib/examples.ts';
  let { examples }: { examples: PromptExample[] } = $props();
  let query = $state('');
  let category = $state('');
  let search: HTMLInputElement;
  const filtered = $derived(filterExamples(examples, query, category));
  function resetFilters() { query = ''; category = ''; search?.focus(); }
</script>

<form class="example-filters" aria-label="Rechercher et filtrer les exemples" onsubmit={event => event.preventDefault()}>
  <div><label class="field-label" for="example-search">Rechercher un exemple</label><input bind:this={search} bind:value={query} id="example-search" type="search" placeholder="Un sujet, un besoin, un mot-clé…" autocomplete="off" /></div>
  <div><label class="field-label" for="example-category">Catégorie</label><select id="example-category" bind:value={category}><option value="">Toutes les catégories</option>{#each exampleCategories as item}<option value={item.id}>{item.label}</option>{/each}</select></div>
  <button type="button" class="button secondary" onclick={resetFilters}>Réinitialiser les filtres</button>
</form>
<p class="example-count" role="status">{filtered.length} exemple{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>
{#if filtered.length}
  <div class="example-grid">
    {#each filtered as example (example.id)}
      <article class="resource-card">
        <span class="category-label">{exampleCategories.find(category => category.id === example.category)?.label}</span>
        <h2>{example.title}</h2><p>{example.description}</p><p class="card-need"><strong>Votre besoin</strong>{example.need}</p>
        <a class="button secondary" href={`/exemples/${example.slug}/`} aria-label={`Voir l’exemple : ${example.title}`}>Voir l’exemple <span aria-hidden="true">↗</span></a>
      </article>
    {/each}
  </div>
{:else}
  <div class="library-empty"><h2>Aucun exemple ne correspond à votre recherche.</h2><p>Essayez un autre mot-clé ou une autre catégorie.</p><button type="button" class="button primary" onclick={resetFilters}>Réinitialiser les filtres</button></div>
{/if}
