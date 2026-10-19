<script lang="ts">
  let { result, stale, onmodify, onreset }: {
    result: string; stale: boolean; onmodify: () => void; onreset: () => void;
  } = $props();
  let copyMessage = $state('');
  let output = $state<HTMLTextAreaElement>();
  $effect(() => { result; stale; copyMessage = ''; });
  async function copy() {
    if (stale || !result) return;
    try {
      await navigator.clipboard.writeText(result);
      copyMessage = 'Prompt copié dans le presse-papiers.';
    } catch {
      output?.focus();
      output?.select();
      copyMessage = 'La copie automatique n’est pas disponible. Le texte est sélectionné : utilisez Ctrl+C (ou Cmd+C), ou la commande Copier de votre appareil.';
    }
  }
</script>

{#if result}
  <div class="result-heading"><span class="ready-mark" aria-hidden="true">✓</span><div><span class="eyebrow">À VOUS DE JOUER</span><h3>{stale ? 'Votre dernier prompt' : 'Votre prompt est prêt'}</h3></div></div>
  {#if stale}<p class="stale-message" role="status">Vos choix ont été modifiés. Générez à nouveau votre prompt pour les prendre en compte.</p>{/if}
  <label class="sr-only" for="prompt-output">Votre prompt complet</label>
  <textarea bind:this={output} id="prompt-output" class="prompt-output" readonly value={result} spellcheck="false"></textarea>
  <div class="result-actions">
    <button type="button" class="button primary" disabled={stale} onclick={copy}>Copier le prompt <span aria-hidden="true">⧉</span></button>
    <button type="button" class="button secondary" onclick={onmodify}>Modifier mes choix</button>
    <button type="button" class="text-button" onclick={onreset}>Recommencer</button>
  </div>
  <p class="copy-message" role="status">{copyMessage}</p>
  <p class="result-tip">Collez ce prompt dans l’IA de votre choix. Testez la réponse, vérifiez les informations et ajustez votre demande si nécessaire.</p>
{:else}
  <div class="empty-result"><span class="empty-icon" aria-hidden="true">[ ↗ ]</span><h3>Vos idées, bientôt un prompt.</h3><p>Renseignez les éléments qui vous sont utiles, puis cliquez sur « Générer mon prompt ».</p></div>
{/if}
