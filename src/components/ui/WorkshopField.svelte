<script lang="ts">
  import HelpPanel from './HelpPanel.svelte';
  import { getOptions } from '../../lib/data-loader.ts';
  import type { FieldDefinition } from '../../lib/prompt-types.ts';
  let { field, value, onchange }: {
    field: FieldDefinition;
    value: string | string[];
    onchange: (value: string | string[]) => void;
  } = $props();
  const options = $derived(getOptions(field.id));
  function toggle(id: string, checked: boolean) {
    const current = Array.isArray(value) ? value : [];
    onchange(checked ? [...current, id] : current.filter(item => item !== id));
  }
</script>

<div class="workshop-field" class:wide={field.type !== 'select'}>
  {#if field.type === 'select' || field.type === 'textarea'}
    <label class="field-label" for={field.id}>{field.label}</label>
    {#if field.type === 'select'}
      <select id={field.id} value={typeof value === 'string' ? value : ''} onchange={event => onchange(event.currentTarget.value)}>
        <option value="">{field.placeholder ?? 'Aucun choix'}</option>
        {#each options as option (option.id)}<option value={option.id}>{option.label}</option>{/each}
      </select>
    {:else}
      <textarea id={field.id} rows="4" value={typeof value === 'string' ? value : ''} placeholder={field.placeholder} oninput={event => onchange(event.currentTarget.value)}></textarea>
      <span class="field-hint">Vos mots sont conservés, sans reformulation.</span>
    {/if}
  {:else}
    <fieldset>
      <legend class="field-label">{field.label}</legend>
      <div class="choice-group" class:long-choices={field.id === 'sourceRequirements'}>
        {#each options as option (option.id)}
          {@const checked = Array.isArray(value) ? value.includes(option.id) : value === option.id}
          <label class="choice" class:selected={checked}>
            {#if field.type === 'checkbox'}
              <input type="checkbox" name={field.id} value={option.id} {checked} onchange={event => toggle(option.id, event.currentTarget.checked)} />
            {:else}
              <input type="radio" name={field.id} value={option.id} {checked} onchange={() => onchange(option.id)} />
            {/if}
            <span>{option.label}</span>
          </label>
        {/each}
      </div>
      {#if field.type === 'radio' && value}
        <button type="button" class="clear-choice" onclick={() => onchange('')}>Effacer ce choix</button>
      {/if}
    </fieldset>
  {/if}
  <HelpPanel id={field.id} text={field.help} label={field.label} />
</div>
