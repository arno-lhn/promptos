<script lang="ts">
  import CopyOutput from '../ui/CopyOutput.svelte';
  let { result, stale, onmodify, onreset }: {
    result: string; stale: boolean; onmodify: () => void; onreset: () => void;
  } = $props();
</script>

{#if result}
  <div class="result-heading"><span class="ready-mark" aria-hidden="true">✓</span><div><span class="eyebrow">VOS PRÉFÉRENCES PRENNENT FORME</span><h3>{stale ? 'Vos dernières instructions' : 'Vos instructions sont prêtes'}</h3></div></div>
  {#if stale}<p class="stale-message" role="status">Vos choix ont été modifiés. Générez à nouveau vos instructions pour les prendre en compte.</p>{/if}
  <div class="result-copy"><CopyOutput text={result} id="instructions-output" label="Vos instructions personnalisées complètes" buttonLabel="Copier mes instructions" disabled={stale} /></div>
  <div class="result-actions"><button type="button" class="button secondary" onclick={onmodify}>Modifier mes choix</button><button type="button" class="text-button" onclick={onreset}>Recommencer</button></div>
  <div class="result-tip"><p>Ces instructions peuvent être utilisées dans les paramètres de personnalisation d’un assistant IA, lorsque cette fonctionnalité est proposée. Leur emplacement et leur fonctionnement varient selon les outils.</p><p>Testez ensuite quelques réponses de votre assistant et ajustez vos préférences si nécessaire.</p></div>
{:else}
  <div class="empty-result"><span class="empty-icon" aria-hidden="true">[ ↗ ]</span><h3>Un assistant qui tient compte de vos préférences.</h3><p>Un seul choix ou un seul texte libre suffit pour construire vos instructions.</p></div>
{/if}
