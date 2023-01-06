
<!-- 

  https://kit.svelte.dev/docs/form-actions

 -->
<svelte:head>
  {#if profile}
    <title>
      {profile.Name} | Profile
    </title>
  {/if}
</svelte:head>

<div class="Instill-Profile-Container">

  <div class="Instill-Profile-Outside {outsideClasses}">
    {#if loading}
      <p>loading profile...</p>
    {:else if slug && !profile}
      <h1>No profiles found at "{slug}"</h1>
    {:else}
      {#if (subpaths && subpaths[0] == 'edit') }
        <div class="_content-narrow">
          <ProfileEdit profile={profile} {slug} />
        </div>
      {/if}
    {/if}
  </div>

  {#if !loading && profile && (subpaths && subpaths.length == 0 || !subpaths)}
    <div class="Instill-Profile {classes}">
      <Profile {profile} {topics} />
    </div>
  {/if}
</div>











<script>

	import { setContext } from 'svelte';

  import Profile from '$instill-helpers/components/Profile.svelte'
  import ProfileEdit from '$instill-helpers/components/ProfileEdit.svelte'

  export let baseConfig, orgSpaces
  setContext( 'config', {baseConfig, orgSpaces})


  export let loading = true, outsideClasses, classes;
  export let profile, topics, slug, subpaths;

  // $: console.log('profile :::' , profile, topics, slug)
  $: if(profile && slug) {
    loading = false
  }
  


</script>











<style lang="postcss" global>
  .Profile {
    h3 {
      padding-top: 0;
    }
  }

  .Profile-cover {
    width: 100%;
    img {
      max-height: 200px;
      object-fit: cover;
      width: 100%;
    }
  }

</style>