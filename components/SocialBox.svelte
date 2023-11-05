
<script>

  import { socialParse } from '../utils/social-parser'

	export let email, socialText, socialProfiles, showFull = true;
  let socials;

	// socialProfiles = socialProfiles; // reactive

  $: if(socialText) {
    socialProfiles = socialParse(socialText);
    socials = Object.values(socialProfiles.resultsMap);
  };

	$: if(socials) {
      socials.map(social => {
      if(social.type == 'twitter')
        social.username = '@'+social.username
      // if(social.type == 'linkedin')
      // 	social.username = 'linkedin/in/'+social.username
      if(social.type == 'google-scholar') {
        social.username = 'Google Scholar'
      }

      if(social.type == 'github') {
        social.type = 'github-circled' // for icon to work
      }
    });
  };
</script>


<div class="SocialBox">
  this is social box


  {#if showFull == true }
    {#if email}
      <div class="Email">
        <i class="_font-phage icon-mail"/>
        <a href={`mailto:${email}`} alt={email}>{ email }</a></div>
    {/if}

    {#each socials as social}
      <!-- social: {{ JSON.stringify(social) }} -->
      <div class={`${social.type}`}>
        <i class={`_font-phage icon-${social.type}`}/>
        <a href={social.url} alt={social.type}>{ social.username }</a> <!-- {social.type} -->
      </div>
    {/each}
  {:else}
    {#if email}
      <span class="Email">
        <a href={`mailto:${email}`} alt={email}><i class="_font-phage icon-mail"/></a></span>
    {/if}

    {#each socials as social}
      <!-- social: {{ JSON.stringify(social) }} -->
      <span class={`${social.type}`}>
        <a href={social.url} alt={social.type}><i class={`_font-phage icon-${social.type}`}/></a> <!-- {social.type} -->
      </span>
    {/each}
  {/if}

</div>


<style type="text/scss">
  :root {
    --socialbox-padding: 0.5rem;
  }
	a {
		text-decoration: none;
	}

  .SocialBox > div {
    padding-bottom: var(--socialbox-padding);
  }
</style>