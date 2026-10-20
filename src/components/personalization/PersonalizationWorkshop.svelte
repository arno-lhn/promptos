<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { personalizationCatalogs, personalizationSections as sections } from '../../lib/personalization-data.ts';
  import { buildPersonalization, isPersonalizationStale } from '../../lib/personalization-builder.ts';
  import { createEmptyPersonalizationState, type PersonalizationCatalogId, type PersonalizationFieldId, type PersonalizationState } from '../../lib/personalization-types.ts';
  import WorkshopField from '../ui/WorkshopField.svelte';
  import HelpPanel from '../ui/HelpPanel.svelte';
  import PersonalizationResult from './PersonalizationResult.svelte';

  let formState = $state<PersonalizationState>(createEmptyPersonalizationState());
  let result = $state('');
  let active = $state(sections[0].id);
  let error = $state('');
  let resetDialog: HTMLDialogElement;
  let resetTrigger: HTMLElement | null = null;
  const candidate = $derived(buildPersonalization(formState));
  const stale = $derived(isPersonalizationStale(formState, result));
  const nav = [...sections.map(({ id, title }) => ({ id, title })), { id: 'instructions-finales', title: 'Mes instructions personnalisées' }];
  function update(id: PersonalizationFieldId, value: string | string[]) {
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
      result = buildPersonalization(formState);
      await tick();
      goTo('instructions-finales');
    } catch { error = 'Les instructions n’ont pas pu être assemblées. Vos choix sont conservés ; vous pouvez réessayer.'; }
  }
  function askReset() {
    resetTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    resetDialog.showModal();
  }
  function cancelReset() { resetDialog.close(); resetTrigger?.focus(); }
  function reset() {
    formState = createEmptyPersonalizationState(); result = ''; error = '';
    resetDialog.close(); goTo(sections[0].id);
  }
  onMount(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) active = visible[0].target.id;
    }, { rootMargin: '-18% 0px -65% 0px' });
    nav.forEach(item => { const element = document.getElementById(item.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  });
</script>

<div class="workshop-layout personalization-workshop">
  <aside class="workshop-sidebar">
    <a class="back-link" href="/">← Retour à l’accueil</a>
    <div class="sidebar-label">MES PRÉFÉRENCES POUR L’IA</div>
    <nav aria-label="Sections des instructions personnalisées" class="section-nav">
      {#each nav as item, index}
        <a href={`#${item.id}`} class:active={active === item.id} aria-current={active === item.id ? 'location' : undefined} onclick={event => { event.preventDefault(); goTo(item.id); }}><span class="nav-number">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span><span class="nav-arrow" aria-hidden="true">↗</span></a>
      {/each}
    </nav>
    <p class="local-note"><span class="local-dot"></span> Vos saisies restent dans cette page, sans sauvegarde.</p>
  </aside>
  <div class="workshop-main">
    <header class="workshop-intro">
      <span class="eyebrow"><span class="small-dot"></span> PERSONNALISER MON IA</span>
      <h1>Créer mes <span>instructions personnalisées</span></h1>
      <p class="intro-lead">Définissez comment vous souhaitez que votre intelligence artificielle vous réponde et vous accompagne.</p>
      <p>Un prompt sert à demander quelque chose à une IA. Les instructions personnalisées servent à définir vos préférences habituelles : ton, niveau de détail, méthode de travail ou présentation des réponses. Elles peuvent être réutilisées dans vos conversations, selon les fonctionnalités de votre outil.</p>
      <p>Ces instructions orientent le comportement de l’assistant, mais ne garantissent pas qu’il respectera chaque préférence dans toutes les situations.</p>
      <HelpPanel id="instructions-introduction" group="instructions-introduction" label="Prompt, instructions personnalisées et message système" text="Un prompt utilisateur formule une demande. Les instructions personnalisées définissent des préférences réutilisables. Un message système est un mécanisme technique dont la disponibilité et la priorité dépendent de l’environnement. Les champs de personnalisation des plateformes ne correspondent pas nécessairement à un véritable message système. Les préférences restent soumises aux règles et aux capacités de l’outil utilisé." />
      <div class="freedom-note"><span aria-hidden="true">↔</span> Aucun champ obligatoire. Aucun ordre imposé. PromptOS assemble vos choix, sans IA intégrée.</div>
    </header>
    <form onsubmit={event => { event.preventDefault(); generate(); }}>
      {#each sections as section, index}
        <section class="workshop-section" id={section.id} tabindex="-1" aria-labelledby={`${section.id}-title`}>
          <div class="section-heading"><span class="section-number">{String(index + 1).padStart(2, '0')}</span><div><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.description}</p></div><span class="optional-label">Facultatif</span></div>
          <div class="section-fields">
            {#each section.fields as field (field.id)}
              {#if field.id === 'usageContext' && section.note}<p class="personal-data-note">{section.note}</p>{/if}
              <WorkshopField {field} sectionId={section.id} value={formState[field.id]} options={field.type === 'textarea' ? [] : personalizationCatalogs[field.id as PersonalizationCatalogId].filter(option => option.active)} onchange={value => update(field.id, value)} />
            {/each}
          </div>
        </section>
      {/each}
      <section id="instructions-finales" class="workshop-section result-section" tabindex="-1" aria-labelledby="instructions-title">
        <div class="section-heading"><span class="section-number">06</span><div><h2 id="instructions-title">Mes instructions personnalisées</h2><p>Retrouvez les préférences que vous avez sélectionnées et copiez-les dans votre assistant IA.</p></div></div>
        <div class="generation-bar"><div><strong>Vos choix, vos mots.</strong><p>Seules les préférences renseignées seront incluses.</p></div><button type="submit" class="button primary" disabled={!candidate}>Générer mes instructions <span aria-hidden="true">↗</span></button></div>
        {#if !candidate}<p class="empty-explanation">Sélectionnez ou renseignez au moins un élément pour construire vos instructions.</p>{/if}
        {#if error}<p class="stale-message" role="alert">{error}</p>{/if}
        <PersonalizationResult {result} {stale} onmodify={() => goTo(sections[0].id)} onreset={askReset} />
      </section>
    </form>
    <div class="workshop-bottom"><span>Des préférences à tester et à ajuster selon vos besoins.</span><a href="/exemples/">Explorer les exemples ↗</a></div>
  </div>
</div>
<dialog bind:this={resetDialog} class="reset-dialog" aria-labelledby="reset-instructions-title" oncancel={event => { event.preventDefault(); cancelReset(); }}>
  <span class="eyebrow">REPARTIR D’UNE PAGE BLANCHE</span><h2 id="reset-instructions-title">Recommencer vos instructions ?</h2><p>Vos choix, vos textes et les instructions générées seront effacés. Cette action ne peut pas être annulée.</p>
  <div class="result-actions"><button type="button" class="button secondary" onclick={cancelReset}>Conserver mes choix</button><button type="button" class="button primary" onclick={reset}>Tout effacer</button></div>
</dialog>
