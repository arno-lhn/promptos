<script lang="ts">
  let { id, text, label }: { id: string; text: string; label: string } = $props();
</script>

<details class="field-help">
  <summary aria-label={`En savoir plus : ${label}`}><span aria-hidden="true">ⓘ</span> En savoir plus</summary>
  <div class="help-content" id={`${id}-help`}>{text}</div>
</details>
