

{#if loud}
  <div class="Card-light my-4">
    <!-- poll data: {JSON.stringify(poll)} <br> -->
    <!-- selection: {pollSelection} {!pollSelection} <br> -->
    isSubmitted: {isSubmitted} <br>

    <!-- {#if $results}
      results: {JSON.stringify($results)}
    {/if} -->
  </div>
{/if}



{#if !isSubmitted}
  <form class="MarkAsAnswer | mt-2" method="POST" action="{actionRoute}"
  use:enhance={({ form, data, cancel }) => {
    error = null
    message = "Saving vote..."
    return async ({ result, update }) => {
      if(result?.data?.success) {
        message = "Vote submitted!"
        // $results = result?.data?.event
        // console.log('new poll results:', $results)
        isSubmitted = true
      } else {
        message = null
        error = result?.data?.message
      }
      update()
    }
  }}
  >

    <SimpleLogin {comment} isHidden={true} />

    <div class="hidden">
      <input name="MarkAsAnswer" value={true} type="text" class="flex-1 | form-input mt-1 block w-full" required>
      <input name="Posts" value={topic.Name} type="number" class="hidden" >
    </div>
    
    <button class="Btn-solid | text-center w-full ease-in-out block" type="submit"  disabled={(!comment.Username || !comment.Password)}>
      <CircleCheck strokeColor="#ffffff" /> {btnCta}
    </button>

    <!-- {#if postTypeSettings?.resultsMode == 'optional'}
      <input class="Btn-text --short | text-center w-full mt-2 ease-in-out block" value="Show Results" on:click={()=>{showResults = true; isSubmitted = true}}>
    {/if} -->

    {#if message}
      <div class="Card-primary | mt-2">
        {message}
      </div>
    {/if}{#if error}
      <div class="Card-error | mt-2 ">
        {error}
      </div>
    {/if}
  </form>
{/if}



<script>
	import { getContext } from 'svelte';
	import { enhance } from '$app/forms';
  import { commentUser } from '$instill/instill-store'
  import CircleCheck from '$plasmid/components/icons/circle-check.svelte'

  import SimpleLogin from '$instill-helpers/components/SimpleLogin.svelte';

  export let loud = false
  export let comment = $commentUser
  export let topic, btnCta = 'Mark as Answer'

  let isSubmitted = false
  let message, error

  let _context = getContext('space')
  let { baseConfig } = _context
  let baseUrl = baseConfig.base_url == '' ? "" : '/instill';
  export let actionRoute = _context._space.settings.actionRoute || `${baseUrl}/spaces`;
</script>