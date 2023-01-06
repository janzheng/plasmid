<div class="Upvote" >
  <form class="" method="POST" action="{actionRoute}"
    use:enhance={({ form, data, cancel }) => {
      ++voteCount
      return async ({ result, update }) => {
        // update() // this somehow clears all inputs, but prevent multiple clicks
      }
    }}
  >
    <div class="HiddenForms | hidden ">
      <input name="Vote" value={1} type="number" class="hidden" >
      <input name="Posts" value={topic.Name} type="number" class="hidden" >
      <input name="Username" bind:value={comment.Username} type="text" class="flex-1 | form-input mt-1 block w-full" placeholder="user-name" required>
      <input name="Password" bind:value={comment.Password} type="password" class="flex-1 | form-input mt-1 block w-full" placeholder="pass-phrase" required>
      {#if useTurnstile}
        <Turnstile on:turnstile-callback={()=>{challengePassed=true}} siteKey={env.PUBLIC_TURNSTILE_SITEKEY} />
      {/if}
    </div>
    <button on:click|stopPropagation={()=>{}} class="Vote-btn | Card-lighter | h-24 mt-2 | text-center" type="submit" value="vote" disabled={(!comment.Username || !comment.Password)}>
      <div class="PostPage-upvote | text-center">
        <div class="">
          <ArrowUpCircle paddingRight={0} />
        </div>
        <div class="my-2">
          {voteCount}
        </div>
      </div>
    </button>
  </form>
</div>


<script>

	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
  import { commentUser } from '$instill/instill-store'
  import { getEventsOfType, getEventsCount } from '$instill-helpers/instill-utils'

  import ArrowUpCircle from '$plasmid/components/icons/arrow-up-circle.svelte'

  let _context = getContext('space')
  export let topic = getContext('space')?._topic;
  let { baseConfig } = _context
  let baseUrl = baseConfig.base_url || '/instill';


  export let actionRoute = getContext('space')?._space?.settings.actionRoute || `${baseUrl}/spaces`

  import { Turnstile } from 'svelte-turnstile';
  import { env } from '$env/dynamic/public';
  export let useTurnstile = getContext('space')?.baseConfig.settings.useTurnstile;
  let challengePassed;


  let comment = $commentUser;

  let votes = getEventsOfType([topic], 'Vote');
  let voteCount = getEventsCount(votes);

</script>

<style global lang="scss">
  .Vote-btn {
    @apply ease-in-out hover:ease-in-out hover:border-blue-500 hover:text-blue-600;
    &:hover {
      @apply ease-in-out;
      svg {
        @apply ease-in-out hover:ease-in-out;
        stroke: var(--color-blue-600) !important;
      }
    }
  }
</style>