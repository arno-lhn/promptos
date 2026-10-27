<script lang="ts">
  import CopyOutput from '../ui/CopyOutput.svelte';
  import type { WatchState } from '../../lib/watch-plan-types.ts';
  import {
    buildScheduledWatchInstructions, buildWatchScheduleRequest, createEmptyWatchSchedule,
    describeWatchSchedule, getWatchScheduleIssues, watchScheduleData as data,
  } from '../../lib/watch-schedule.ts';
  let { watchState, stale, planReady, expanded = $bindable(false), ongotoresult }: {
    watchState: WatchState; stale: boolean; planReady: boolean; expanded?: boolean; ongotoresult: () => void;
  } = $props();
  let config = $state(createEmptyWatchSchedule());
  const issues = $derived(getWatchScheduleIssues(watchState, config));
  const task = $derived(buildScheduledWatchInstructions(watchState, config));
  const request = $derived(buildWatchScheduleRequest(watchState, config));
  const schedule = $derived(describeWatchSchedule(config));
</script>

<section id="watch-schedule" class="workshop-section watch-schedule" tabindex="-1" aria-labelledby="watch-schedule-title">
  <div class="section-heading"><span class="section-number">07</span><div><h2 id="watch-schedule-title">Planifier ma veille</h2><p>Préparez le travail à répéter et son calendrier dans votre assistant IA.</p></div><span class="optional-label">Facultatif</span></div>
  <div class="schedule-body">
    <p>Une fois votre plan relu et vos premières sources examinées, testez une exécution, puis demandez sa planification. Vous pouvez préparer une recherche avec synthèse ou un simple rappel.</p>
    <p>Cette étape ne crée aucune tâche dans PromptOS. La disponibilité de la planification, des outils et des notifications doit être vérifiée dans votre compte. <a class="text-button inline-link" href={data.documentationUrl}>Guide officiel OpenAI : tester puis planifier</a></p>
    <button type="button" class="button secondary" aria-expanded={expanded} aria-controls="watch-schedule-content" onclick={() => expanded = !expanded}>{expanded ? 'Masquer la préparation' : 'Préparer une tâche planifiée'}</button>
    <div id="watch-schedule-content" hidden={!expanded}>
      {#if !planReady}
        <div class="schedule-readiness"><p><strong>Générez d’abord votre demande de plan de veille.</strong></p><p>Après avoir relu le plan dans votre assistant, revenez ici pour choisir une recherche récurrente ou un rappel et préparer les consignes à copier.</p><button type="button" class="button secondary" onclick={ongotoresult}>Aller à la génération du plan <span aria-hidden="true">↗</span></button></div>
      {:else}
      {#if stale}<p class="stale-message" role="status">Vos repères ont changé. Régénérez d’abord votre demande de plan de veille ; la préparation et la copie de la tâche sont désactivées jusque-là.</p>{/if}
      <form class="schedule-form" aria-label="Préparer le calendrier de la veille" onsubmit={event => event.preventDefault()}>
        <fieldset disabled={stale}>
          <legend class="sr-only">Mode, calendrier et consignes de la tâche</legend>
          <div class="schedule-fields">
            <fieldset class="schedule-wide">
              <legend class="field-label">Que souhaitez-vous planifier ?</legend>
              <div class="choice-group long-choices">
                {#each data.modes as mode}
                  <label class="choice" class:selected={config.mode === mode.id}><input type="radio" name="schedule-mode" value={mode.id} bind:group={config.mode} /><span><strong>{mode.label}</strong><span class="schedule-mode-help">{mode.help}</span></span></label>
                {/each}
              </div>
            </fieldset>
            <div><label class="field-label" for="schedule-title">Nom de la tâche (facultatif)</label><input id="schedule-title" type="text" bind:value={config.title} placeholder="Exemple : Ma veille réglementaire" /></div>
            <div><label class="field-label" for="schedule-cadence">Fréquence de la tâche</label><select id="schedule-cadence" bind:value={config.cadence}><option value="">Choisir une fréquence</option>{#each data.cadences as item}<option value={item.id}>{item.label}</option>{/each}</select></div>
            {#if config.cadence === 'weekly'}
              <div><label class="field-label" for="schedule-weekday">Jour de la semaine</label><select id="schedule-weekday" bind:value={config.weekday}><option value="">Choisir un jour</option>{#each data.weekdays as item}<option value={item.id}>{item.label}</option>{/each}</select></div>
            {:else if config.cadence === 'monthly'}
              <div><label class="field-label" for="schedule-monthday">Jour du mois</label><select id="schedule-monthday" bind:value={config.monthlyDay}><option value="">Choisir un jour</option>{#each Array.from({ length: 28 }, (_, i) => String(i + 1)) as day}<option value={day}>{day}</option>{/each}</select><p class="field-hint">De 1 à 28, pour que ce jour existe chaque mois.</p></div>
            {/if}
            <div><label class="field-label" for="schedule-time">Heure locale</label><input id="schedule-time" type="time" bind:value={config.time} /></div>
            <div><label class="field-label" for="schedule-timezone">Fuseau horaire</label><input id="schedule-timezone" type="text" bind:value={config.timezone} placeholder="Exemple : Europe/Paris" list="schedule-timezones" autocomplete="off" aria-describedby="schedule-timezone-hint" /><datalist id="schedule-timezones"><option value="Europe/Paris"></option><option value="Europe/Brussels"></option><option value="Europe/London"></option><option value="America/Montreal"></option><option value="UTC"></option></datalist><p class="field-hint" id="schedule-timezone-hint">Indiquez un fuseau tel que Europe/Paris, qui tient compte des changements d’heure, ou UTC.</p></div>
            <div><label class="field-label" for="schedule-end">Date de fin (facultatif)</label><input id="schedule-end" type="date" bind:value={config.endDate} /><p class="field-hint">Sans date, la durée restera à confirmer avant la création.</p></div>
            {#if config.mode === 'research'}
              <div><label class="field-label" for="schedule-window">Période à examiner à chaque recherche</label><select id="schedule-window" bind:value={config.window}><option value="">Choisir une période</option>{#each data.windows as item}<option value={item.id}>{item.label}</option>{/each}</select><p class="field-hint">La période recherchée et la fréquence sont différentes. Une période trop courte peut laisser des informations entre deux exécutions. L’historique n’est utilisé que s’il est accessible.</p></div>
              <div><label class="field-label" for="schedule-limit">Taille de la synthèse (facultatif)</label><select id="schedule-limit" bind:value={config.limit}><option value="">Privilégier les informations les plus pertinentes</option>{#each data.limits as item}<option value={item.id}>{item.label}</option>{/each}</select></div>
            {/if}
            <div class="schedule-wide"><label class="field-label" for="schedule-sources">Sources retenues pour la tâche (facultatif)</label><textarea id="schedule-sources" rows="4" bind:value={config.approvedSources} placeholder="Après les avoir examinées, collez ici les sources que vous voulez suivre : noms et liens, une source par ligne." aria-describedby="schedule-sources-hint"></textarea><p class="field-hint" id="schedule-sources-hint">Les sources proposées dans la réponse de votre IA ne sont pas récupérées automatiquement. Ces sources restent à vérifier lors de leur utilisation.</p></div>
          </div>
        </fieldset>
      </form>
      {#if issues.length}
        <div class="schedule-readiness" role="status"><p><strong>Pour préparer les textes copiables :</strong></p><ul>{#each issues as issue}<li>{issue}</li>{/each}</ul></div>
      {:else}
        <div class="schedule-preview"><p><strong>Calendrier demandé :</strong> {schedule}</p><p>{config.endDate ? `Fin demandée le ${config.endDate}, à vérifier avant la création.` : 'Aucune date de fin renseignée : ce point devra être confirmé.'}</p><p>La fréquence de cette tâche est celle indiquée ici, indépendamment du rythme de consultation proposé dans votre plan.</p></div>
        <section class="schedule-step" aria-labelledby="schedule-test-title"><h3 id="schedule-test-title">1. Tester le travail une fois</h3><p>Copiez ces instructions dans votre assistant et examinez le résultat. En mode recherche, vérifiez qu’il consulte réellement les sources et produit des références utiles. Corrigez le périmètre ou les sources avant de planifier.</p><CopyOutput text={task} id="watch-task-instructions" label="Instructions du travail à répéter" buttonLabel="Copier les instructions à tester" disabled={stale} /></section>
        <section class="schedule-step" aria-labelledby="schedule-request-title"><h3 id="schedule-request-title">2. Demander la création de la tâche</h3><p>Après un test satisfaisant, collez cette demande dans la même conversation. Elle demande un récapitulatif et votre accord avant la création effective, si l’outil le permet.</p><CopyOutput text={request} id="watch-schedule-request" label="Demande de création de la tâche planifiée" buttonLabel="Copier la demande de planification" disabled={stale} /></section>
        <section class="schedule-step" aria-labelledby="schedule-confirmation-title"><h3 id="schedule-confirmation-title">3. Vérifier l’enregistrement et les premiers résultats</h3><ul><li>Retrouvez la tâche dans l’espace de planification de votre outil et vérifiez son nom, son mode, son fuseau et sa prochaine exécution.</li><li>Contrôlez les notifications disponibles et les premières exécutions, puis ajustez les consignes ou le rythme.</li><li>Repérez comment modifier, mettre en pause ou supprimer la tâche, notamment si vous ne faisiez qu’un exercice.</li></ul><p>Si vous utilisez directement un formulaire de planification, utilisez le premier texte comme consignes et reportez le calendrier affiché. Une réponse qui décrit une tâche ne prouve pas qu’elle est enregistrée : seule la confirmation effective dans l’outil l’établit.</p></section>
      {/if}
      {/if}
    </div>
  </div>
</section>
