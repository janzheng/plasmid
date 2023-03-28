

{#if loading}
  <div class="_section-page _divider-top _divider-bottom _padder-top _padder-bottom _margin-center">
    <div class="_section-article _margin-center">
        <div class="_card _padding __white">
          {#if id}
            Loading registration number: {id}
          {:else}
            Loading ...
          {/if}
        </div>
      </div>
    </div>
{:else}
    <slot />
{/if}


<script>
  
  import { onMount } from 'svelte';
  import { goto, stores } from '@sapper/app';


  import { Profile, checkUser, ID, isAttending } from "@/stores/profile"
  import { _content, _get } from "@/stores/sitedata"

  export let id, loading=true
  const {page} = stores()

  
  // load data onmount to support refreshing
  // and syncing w/ store
  onMount(async () => {

    await checkUser(id)

    // console.log('Profile check:', $Profile) 
    if(!$Profile && !id || !isAttending($Profile) || !$Profile.ticketId) {
      console.error('No user access')
      goto(`/start?path=${$page.path}`)
      return
    }

    loading = false
  })

  // $: console.log('[UserCheck]', $Profile)

</script>

<style global type="text/scss">
</style>
