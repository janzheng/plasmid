

{#if loud}
  <div class="Card-light my-4">
    poll data: {JSON.stringify(poll)} <br>
    selection: {pollSelection} {!pollSelection} <br>
    isSubmitted: {isSubmitted} <br>

    {#if $results}
      results: {JSON.stringify($results)}
    {/if}
  </div>
{/if}



{#if !isSubmitted}
  <form class="Poll Card-light my-4" method="POST" action="{actionRoute}"
  use:enhance={({ form, data, cancel }) => {
    error = null
    message = "Saving vote..."
    return async ({ result, update }) => {
      console.log('--> result', result)
      if(result?.data?.success) {
        message = "Vote submitted!"
        $results = result?.data?.event
        // console.log('new poll results:', $results)
        isSubmitted = true
      } else {
        message = null
        error = result?.data?.error
      }
    }
  }}
  >
    <!-- <div class="mb-4">A confirmation will be sent to your new email address</div> -->
    {#if poll && poll.Options}
      <legend class="text-gray-700 text-lg">{poll.Question}</legend>
      <div class="mt-2 | w-full text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200">
        {#each poll.Options as option, i}
          {#if i == 0}
            <div class="w-full rounded-t-lg border-b border-gray-200">
              <label class="inline-flex items-center p-2 w-full">
                <input value={option} bind:group={pollSelection} class="form-radio" type="radio" checked="" name="PollVote" required>
                <span class="ml-2">{@html (option)}</span>
              </label>
            </div>
          {:else if i < poll.Options.length - 1}
            <div class="w-full rounded-t-lg border-b border-gray-200">
              <label class="inline-flex items-center p-2 w-full">
                <input value={option} bind:group={pollSelection} class="form-radio" type="radio" name="PollVote" required>
                <span class="ml-2">{@html (option)}</span>
              </label>
            </div>
          {:else}
            <div class="w-full rounded-t-lg">
              <label class="inline-flex items-center p-2 w-full">
                <input value={option} bind:group={pollSelection} class="form-radio" type="radio" name="PollVote" required>
                <span class="ml-2">{@html (option)}</span>
              </label>
            </div>
          {/if}
        {/each}
      </div>
    {/if}

    <div class="hidden">
      {#if useTurnstile}
        <Turnstile on:turnstile-callback={()=>{challengePassed=true}} siteKey={env.PUBLIC_TURNSTILE_SITEKEY} />
      {/if}
      <input name="Posts" value={topic.Name} type="number" class="hidden" >
    </div>

    <SimpleLogin {comment} />
    
    <input class="Btn-solid | text-center w-full mt-2 ease-in-out block" type="submit" value="{voteCta}" disabled={!pollSelection || (!comment.Username || !comment.Password)}>

    {#if postTypeSettings?.resultsMode == 'optional'}
      <input class="Btn-text --short | text-center w-full mt-2 ease-in-out block" value="Show Results" on:click={()=>{showResults = true; isSubmitted = true}}>
    {/if}

    {#if message}
      <div class="Card-primary | mt-4 ">
        {message}
      </div>
    {/if}{#if error}
      <div class="Card-error | mt-4 ">
        {error}
      </div>
    {/if}
  </form>
{/if}

{#if showResults || isSubmitted}
  <div class="Poll-results">
    <!-- results, description of results -->
    <div class="Card-light my-4">
      <legend class="text-gray-700 text-lg">{poll.Question}</legend>
      <div class="Poll-tally-list">
        {#each Object.keys(getTallyFromArr($results?.JsonArr?.arr)) as tallyKey}
          {@const tallyObj = getTallyFromArr($results.JsonArr?.arr)}
          {@const tallySize = tallyObj[tallyKey]}
          {@const tallyTotal = $results?.Data}
          <div class="Poll-tally">
            <div class="relative w-full">
              <div class="absolute py-[0.4rem] px-2 h-full w-full">{Math.round(tallySize/tallyTotal*100)}% {tallyKey}</div>
              <div style="width: {tallySize/tallyTotal*100}%" class="bar border-2 border-transparent bg-blue-100 rounded-lg | py-1 px-2 mt-2">&nbsp;</div>
            </div>
          </div>
        {/each}
      </div>
      <div class="Poll-total | text-sm mt-2">{$results?.Data} votes</div>
    </div>
    
  </div>
{/if}


<script>
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
  import { maskPassword } from "$plasmid/utils/auth/auth-helpers"
  import { commentUser } from '$instill/instill-store'

  import SimpleLogin from '$instill-helpers/components/SimpleLogin.svelte';

  export let loud = false

  let _context = getContext('space')
  let { baseConfig } = _context
  let baseUrl = baseConfig.base_url == '' ? "" : '/instill';
  export let actionRoute = _context._space.settings.actionRoute || `${baseUrl}/spaces`

  import { Turnstile } from 'svelte-turnstile';
  import { env } from '$env/dynamic/public';
  export let useTurnstile = getContext('space')?.baseConfig.settings.useTurnstile;
  let challengePassed;

  export let comment = $commentUser, _space = {}
  export let topic, poll, voteCta = 'Vote'
  let pollSelection, isSubmitted = false


  let message, error
  let results = writable({})
  $results = topic?.['Events::data']?.[0]

  let postTypeSettings = _space.settings?.postTypeSettings['Poll']
  export let showResults = postTypeSettings?.resultsMode == 'always' ? true : false
  // $: console.log('postTypeSettings', postTypeSettings, showResults)

  let getTallyFromArr = (arr) => {
    let tally = {}
    arr?.forEach((item) => {
      if(!tally[item.PollVote]) tally[item.PollVote] = 0
      tally[item.PollVote]++
    })
    return tally
  }
</script>