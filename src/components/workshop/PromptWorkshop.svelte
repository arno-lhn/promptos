<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { sections } from '../../lib/data-loader.ts';
  import { buildPrompt, isResultStale } from '../../lib/prompt-builder.ts';
  import { createEmptyState, type FieldId, type FormState } from '../../lib/prompt-types.ts';
  import WorkshopField from '../ui/WorkshopField.svelte';
  import PromptResult from './PromptResult.svelte';

  let formState = $state<FormState>(createEmptyState());
  let result = $state('');
  let active = $state(sections[0].id);
  let error = $state('');
  let resetDialog: HTMLDialogElement;
  let resetTrigger: HTMLElement | null = null;
  const candidate = $derived(buildPrompt(formState));
  const stale = $derived(isResultStale(formState, result));
  const nav = [...sections.map(({ id, title }) => ({ id, title })), { id: 'prompt-final', title: 'Prompt final' }];

  function update(id: FieldId, value: string | string[]) {
    formState = { ...formState, [id]: value };
    error = '';
  }
  function goTo(id: string) {
    active = id;
    const element = document.getElementById(id);
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  async function generate() {
    try {
      result = buildPrompt(formState);
      await tick();
      goTo('prompt-final');
    } catch {
      error = 'Le prompt n’a pas pu être assemblé. Vos choix sont conservés ; vous pouvez réessayer.';
    }
  }
  function askReset() {
    resetTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    resetDialog.showModal();
  }
  function cancelReset() {
    resetDialog.close();
    resetTrigger?.focus();
  }
  function reset() {
    formState = createEmptyState(); result = ''; error = '';
    resetDialog.close();
    goTo(sections[0].id);
  }
  onMount(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) active = visible[0].target.id;
    }, { rootMargin: '-18% 0px -65% 0px' });
    nav.forEach(item => { const section = document.getElementById(item.id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  });
</script>

<div class="workshop-layout">
  <aside class="workshop-sidebar">
    <a class="back-link" href="/">← Retour à l’accueil</a>
    <div class="sidebar-label">LES COMPOSANTS DU PROMPT</div>
    <nav aria-label="Blocs de construction" class="section-nav">
      {#each nav as item, index}
        <a href={`#${item.id}`} class:active={active === item.id} aria-current={active === item.id ? 'location' : undefined} onclick={event => { event.preventDefault(); goTo(item.id); }}>
          <span class="nav-number">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span><span class="nav-arrow" aria-hidden="true">↗</span>
        </a>
      {/each}
    </nav>
    <div class="sidebar-note"><span aria-hidden="true">✳</span><h3>Votre besoin donne le rythme.</h3><p>Explorez les blocs dans l’ordre qui vous convient. Chaque champ est facultatif.</p></div>
    <p class="local-note"><span class="local-dot"></span> Vos saisies restent dans ce navigateur.</p>
  </aside>

  <div class="workshop-main">
    <header class="workshop-intro">
      <span class="eyebrow"><span class="small-dot"></span> L’ATELIER DE CONSTRUCTION</span>
      <h1>Une idée en tête.<br /><span>Un prompt qui prend forme.</span></h1>
      <p>Choisissez ce qui vous est utile. Précisez avec vos mots.<br class="desktop-break" /> Construisez une demande qui vous ressemble.</p>
      <div class="freedom-note"><span aria-hidden="true">↔</span> Aucun champ obligatoire. Aucun ordre imposé.</div>
    </header>

    <form onsubmit={event => { event.preventDefault(); generate(); }}>
      {#each sections as section, index}
        <section class="workshop-section" id={section.id} tabindex="-1" aria-labelledby={`${section.id}-title`}>
          <div class="section-heading"><span class="section-number">{String(index + 1).padStart(2, '0')}</span><div><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.description}</p></div><span class="optional-label">Facultatif</span></div>
          <div class="section-fields">
            {#each section.fields as field (field.id)}
              <WorkshopField {field} value={formState[field.id]} onchange={value => update(field.id, value)} />
            {/each}
          </div>
          {#if section.note}<p class="section-note"><span aria-hidden="true">↳</span> {section.note}</p>{/if}
        </section>
      {/each}

      <section id="prompt-final" class="workshop-section result-section" tabindex="-1" aria-labelledby="result-title">
        <div class="section-heading"><span class="section-number">06</span><div><h2 id="result-title">Prompt final</h2><p>Assemblez vos choix en une demande claire et structurée.</p></div></div>
        <div class="generation-bar"><div><strong>Tout part de vos choix.</strong><p>Seuls les éléments renseignés seront inclus.</p></div><button type="submit" class="button primary" disabled={!candidate}>Générer mon prompt <span aria-hidden="true">↗</span></button></div>
        {#if !candidate}<p class="empty-explanation">Sélectionnez ou renseignez au moins un élément pour construire votre prompt.</p>{/if}
        {#if error}<p role="alert" class="stale-message">{error}</p>{/if}
        <PromptResult {result} {stale} onmodify={() => goTo(sections[0].id)} onreset={askReset} />
      </section>
    </form>
    <div class="workshop-bottom"><span>Un bon prompt commence par une intention claire.</span><a href="/">PromptOS ↗</a></div>
  </div>
</div>

<dialog bind:this={resetDialog} class="reset-dialog" aria-labelledby="reset-title" oncancel={event => { event.preventDefault(); cancelReset(); }}>
  <span class="eyebrow">REPARTIR D’UNE PAGE BLANCHE</span>
  <h2 id="reset-title">Recommencer votre prompt ?</h2>
  <p>Vos choix, vos textes et le prompt généré seront effacés. Cette action ne peut pas être annulée.</p>
  <div class="result-actions"><button type="button" class="button secondary" onclick={cancelReset}>Conserver mes choix</button><button type="button" class="button primary" onclick={reset}>Tout effacer</button></div>
</dialog>
