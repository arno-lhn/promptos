<script lang="ts">
  let { text, id, label, buttonLabel, disabled = false }: {
    text: string; id: string; label: string; buttonLabel: string; disabled?: boolean;
  } = $props();
  let output = $state<HTMLTextAreaElement>();
  let message = $state('');
  $effect(() => { text; disabled; message = ''; });
  async function copy() {
    if (disabled || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      message = 'Texte copié dans le presse-papiers.';
    } catch {
      output?.focus();
      output?.select();
      message = 'La copie automatique n’est pas disponible. Le texte est sélectionné : utilisez Ctrl+C (ou Cmd+C), ou la commande Copier de votre appareil.';
    }
  }
</script>

<div class="copy-output">
  <label class="sr-only" for={id}>{label}</label>
  <textarea bind:this={output} {id} class="copy-output-text" readonly value={text} spellcheck="false" rows="14"></textarea>
  <button type="button" class="button primary" disabled={disabled || !text} onclick={copy}>{buttonLabel} <span aria-hidden="true">⧉</span></button>
  <p class="copy-status" role="status">{message}</p>
</div>
