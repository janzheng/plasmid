

{#if profile && profile.fields['ProfileImage'] && profile.fields['ProfileImage'].length > 0}
<span class="Profile-thumb">
  <!-- <a rel=preload href="/m/{profile.fields['Slug']}"> -->
    {#if imgUrl}
      <img class="Profile-thumb-img" alt="{profile['Name']}" 
      src="{imgUrl}">
    {/if}
    {#if showName}
      <span class="_padding-left">{profile.fields['Name']}</span>
    {/if}
  <!-- </a> -->
</span>
{/if} 


<script>

  export let profile, showName=false

  const handleClick = (e) => {
    // console.log('click!')
    // e.preventDefault()
  }

  let imgUrl, profileImage

  $: if(profile) {
    profileImage = profile.fields['ProfileImage'] || profile.fields['Profile']
  }

  // profile images / thumbnails come in different flavors, this helps prevent crashing / helps get the right profile type
  $: if(profile && profileImage && profileImage.length > 0 && profileImage[0]['thumbnails']) {
    imgUrl = profile.fields['ProfileImage'][0]['thumbnails']['small']['url']
  } else if(profile && profileImage && profileImage.length) {
    imgUrl = profile.fields['ProfileImage'][0]['url'] || null
  }
</script>


<style type="text/scss">

.Profile-thumb {
  position: relative;
  z-index: 1000;
}

</style>