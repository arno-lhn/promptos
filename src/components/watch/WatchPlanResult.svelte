<script lang="ts">
  import CopyOutput from '../ui/CopyOutput.svelte';
  let { result, stale, onmodify, onreset }: {
    result: string; stale: boolean; onmodify: () => void; onreset: () => void;
  } = $props();
</script>

{#if result}
  <div class="result-heading"><span class="ready-mark" aria-hidden="true">✓</span><div><span class="eyebrow">UNE CONSIGNE À UTILISER DANS VOTRE IA</span><h3>{stale ? 'Votre dernière demande' : 'Votre demande de plan de veille est prête'}</h3></div></div>
  {#if stale}<p class="stale-message" role="status">Vos repères ont été modifiés. Générez à nouveau votre demande pour les prendre en compte.</p>{/if}
  <div class="result-copy"><CopyOutput text={result} id="watch-prompt-output" label="Votre prompt complet pour construire un plan de veille" buttonLabel="Copier ma demande" disabled={stale} /></div>
  <div class="result-actions"><button type="button" class="button secondary" onclick={onmodify}>Modifier mes choix</button><button type="button" class="text-button" onclick={onreset}>Recommencer</button></div>
  <div class="result-tip"><p>Collez cette demande dans votre assistant IA. S’il peut rechercher sur Internet, il pourra proposer une première sélection de sources. Sinon, utilisez les requêtes et les pistes proposées pour effectuer vos recherches.</p><p>Ouvrez les liens, examinez les justifications et validez le premier classement avant de retenir vos sources. Le plan reçu reste à adapter à votre activité et aux consignes de votre exercice.</p></div>
{:else}
  <div class="empty-result"><span class="empty-icon" aria-hidden="true">[ ↗ ]</span><h3>Une veille qui part de votre besoin.</h3><p>Un sujet, une préférence ou un texte libre suffit pour préparer votre demande. Plus votre cadrage est précis, plus vous pourrez juger les sources proposées.</p></div>
{/if}
