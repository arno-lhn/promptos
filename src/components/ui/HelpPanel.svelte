<script lang="ts">
  let { id, group, text, label }: { id: string; group: string; text: string; label: string } = $props();
</script>

<details class="field-help" name={`help-${group}`}>
  <summary aria-label={`En savoir plus : ${label}`}><span aria-hidden="true">ⓘ</span> En savoir plus <span class="help-chevron" aria-hidden="true">⌄</span></summary>
  <div class="help-content" id={`${id}-help`}>
    <p class="help-title">{label}</p>
    <p>{text}</p>
  </div>
</details>
