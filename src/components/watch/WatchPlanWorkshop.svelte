<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { watchCatalogs, watchRules, watchSections as sections } from '../../lib/watch-plan-data.ts';
  import { buildWatchPrompt, isWatchPromptStale } from '../../lib/watch-plan-builder.ts';
  import { createEmptyWatchState, type WatchCatalogId, type WatchFieldId, type WatchState } from '../../lib/watch-plan-types.ts';
  import WorkshopField from '../ui/WorkshopField.svelte';
  import WatchPlanResult from './WatchPlanResult.svelte';
  import WatchSchedulePanel from './WatchSchedulePanel.svelte';

  let formState = $state<WatchState>(createEmptyWatchState());
  let result = $state('');
  let active = $state(sections[0].id);
  let error = $state('');
  let scheduleExpanded = $state(false);
  let resetDialog: HTMLDialogElement;
  let resetTrigger: HTMLElement | null = null;
  const candidate = $derived(buildWatchPrompt(formState));
  const stale = $derived(isWatchPromptStale(formState, result));
  const nav = [...sections.map(({ id, title }) => ({ id, title })), { id: 'watch-result', title: 'Ma demande de plan de veille' }, { id: 'watch-schedule', title: 'Planifier ma veille' }];
  function update(id: WatchFieldId, value: string | string[]) {
    formState = { ...formState, [id]: value };
    error = '';
  }
  function goTo(id: string) {
    if (id === 'watch-schedule') scheduleExpanded = true;
    active = id;
    const element = document.getElementById(id);
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  async function generate() {
    try {
      result = buildWatchPrompt(formState);
      await tick();
      goTo('watch-result');
    } catch { error = 'La demande n’a pas pu être assemblée. Vos choix sont conservés ; vous pouvez réessayer.'; }
  }
  function askReset() {
    resetTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    resetDialog.showModal();
  }
  function cancelReset() { resetDialog.close(); resetTrigger?.focus(); }
  function reset() {
    formState = createEmptyWatchState(); result = ''; error = ''; scheduleExpanded = false;
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

<div class="workshop-layout watch-workshop">
  <aside class="workshop-sidebar">
    <a class="back-link" href="/">← Retour à l’accueil</a>
    <div class="sidebar-label">CONSTRUIRE MON PLAN DE VEILLE</div>
    <nav aria-label="Sections du plan de veille" class="section-nav">
      {#each nav as item, index}
        <a href={`#${item.id}`} class:active={active === item.id} aria-current={active === item.id ? 'location' : undefined} onclick={event => { event.preventDefault(); goTo(item.id); }}><span class="nav-number">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span><span class="nav-arrow" aria-hidden="true">↗</span></a>
      {/each}
    </nav>
    <p class="local-note"><span class="local-dot"></span> Vos saisies restent dans cette page, sans sauvegarde.</p>
  </aside>
  <div class="workshop-main">
    <header class="workshop-intro">
      <span class="eyebrow"><span class="small-dot"></span> UNE VEILLE UTILE À VOTRE ACTIVITÉ</span>
      <h1>Construire mon <span>plan de veille</span></h1>
      <p>Définissez votre sujet, découvrez des sources complémentaires et préparez un premier tri de leur pertinence avec l’aide de votre IA.</p>
      <p>Vous pouvez ensuite préparer une tâche planifiée : une recherche récurrente avec synthèse sourcée ou un rappel. Retrouvez cette suite dans l’étape « Planifier ma veille ».</p>
      <p>PromptOS prépare une demande à copier dans votre assistant. La recherche et la création du plan se feront dans cet outil, selon ses capacités. Aucune recherche ni alerte n’est exécutée ici.</p>
      <details class="field-help" name="watch-introduction">
        <summary><span aria-hidden="true">ⓘ</span> Comprendre la recherche et l’évaluation des sources <span class="help-chevron" aria-hidden="true">⌄</span></summary>
        <div class="help-content">
          <p class="help-title">Le prompt demandera toujours de :</p>
          <ul>{#each watchRules.summary as item}<li>{item}</li>{/each}</ul>
          {#each watchRules.evaluation as criterion}<p class="help-title">{criterion.title}</p><p>{criterion.text}</p>{/each}
          <p>Exemple : un commentaire spécialisé peut être très utile pour repérer une évolution, mais le document d’origine reste à consulter. Inversement, un site officiel peut être crédible tout en étant hors de votre périmètre.</p>
          <p>Repères pour approfondir : <a class="inline-link text-button" href="https://libguides.hec.ca/evaluer">Évaluer ses sources — HEC Montréal</a> et <a class="inline-link text-button" href="https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative">Comprendre les limites des IA génératives — CNIL</a>.</p>
        </div>
      </details>
      <div class="freedom-note"><span aria-hidden="true">↔</span> Tous les champs sont facultatifs. Vous pouvez commencer sans connaître de sources.</div>
    </header>
    <form onsubmit={event => { event.preventDefault(); generate(); }}>
      {#each sections as section, index}
        <section class="workshop-section" id={section.id} tabindex="-1" aria-labelledby={`${section.id}-title`}>
          <div class="section-heading"><span class="section-number">{String(index + 1).padStart(2, '0')}</span><div><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.description}</p></div><span class="optional-label">Facultatif</span></div>
          <div class="section-fields">
            {#each section.fields as field (field.id)}
              <WorkshopField {field} sectionId={section.id} value={formState[field.id]} options={field.type === 'textarea' ? [] : watchCatalogs[field.id as WatchCatalogId].filter(option => option.active)} onchange={value => update(field.id, value)} />
            {/each}
          </div>
        </section>
      {/each}
      <section id="watch-result" class="workshop-section result-section" tabindex="-1" aria-labelledby="watch-result-title">
        <div class="section-heading"><span class="section-number">06</span><div><h2 id="watch-result-title">Ma demande de plan de veille</h2><p>Rassemblez vos repères dans un prompt pour rechercher, évaluer et organiser votre veille.</p></div></div>
        <div class="generation-bar"><div><strong>Vos repères et une méthode explicite.</strong><p>Les choix renseignés sont associés aux règles de recherche et de vérification présentées dans l’introduction.</p></div><button type="submit" class="button primary" disabled={!candidate}>Générer ma demande <span aria-hidden="true">↗</span></button></div>
        {#if !candidate}<p class="empty-explanation">Indiquez au moins un repère ou sélectionnez une préférence pour construire votre demande.</p>{/if}
        {#if error}<p class="stale-message" role="alert">{error}</p>{/if}
        <WatchPlanResult {result} {stale} onmodify={() => goTo(sections[0].id)} onreset={askReset} onplan={() => goTo('watch-schedule')} />
      </section>
    </form>
    {#key Boolean(result)}<WatchSchedulePanel watchState={formState} {stale} planReady={Boolean(result)} bind:expanded={scheduleExpanded} ongotoresult={() => goTo('watch-result')} />{/key}
    <div class="workshop-bottom"><span>Des sources à examiner, un premier classement à valider, une veille à faire évoluer.</span><a href="/exemples/recherche-documentaire/">Voir un exemple de recherche ↗</a></div>
  </div>
</div>
<dialog bind:this={resetDialog} class="reset-dialog" aria-labelledby="reset-watch-title" oncancel={event => { event.preventDefault(); cancelReset(); }}>
  <span class="eyebrow">REPARTIR D’UNE PAGE BLANCHE</span><h2 id="reset-watch-title">Recommencer votre plan de veille ?</h2><p>Vos repères, vos choix, la demande générée et la préparation d’une tâche planifiée seront effacés. Cette action ne peut pas être annulée.</p>
  <div class="result-actions"><button type="button" class="button secondary" onclick={cancelReset}>Conserver mes choix</button><button type="button" class="button primary" onclick={reset}>Tout effacer</button></div>
</dialog>
