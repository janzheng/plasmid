
<script>

  import Icon from '@iconify/svelte';
  import { socialParse } from '../utils/social-parser'

	export let email, socialText, socialProfiles, classes = 'flex gap-1';
  export let linkClass, iconClass;
  export let showText = false;
  export let showFullLinks = false;
  let socials;
  
  if (email) {
    let emailRegex = /\S+@\S+\.\S+/;
    let match = email.match(emailRegex);
    if (match) {
      email = match[0];
    }
  }

  if(socialText) {
    socialProfiles = socialParse(socialText);
    socials = socialProfiles.resultsArr;

    socials.map(social => {
      if(social.type == 'twitter')
        social.username = '@'+social.username
      // if(social.type == 'linkedin')
      // 	social.username = 'linkedin/in/'+social.username
      if(social.type == 'google-scholar') {
        social.username = 'Google Scholar'
      }

      // if(social.type == 'github') {
      //   social.type = 'github-circled' // for icon to work
      // }
    });
  };

  const iconMap = {
    'url': 'mdi:earth',
    'twitter': 'tabler:brand-x',
    'youtube': 'mdi:youtube',
    'medium': 'mdi:medium',
    'linkedin': 'mdi:linkedin',
    'instagram': 'mdi:instagram',
    'vimeo': 'mdi:vimeo',
    'github': 'mdi:github',
    'email': 'tabler:mail',
    'orcid': 'academicons:orcid',
    'researchgate': 'academicons:researchgate',
    'publons': 'academicons:publons',
    'protocolsio': 'academicons:protocolsio',
    'googlescholar': 'academicons:google-scholar',
  };

</script>

<div class="SocialBox | {classes}">
  <!-- {#if showFull == true }
    {#if email}
      <div class="Email">
        <i class="_font-phage icon-mail"/>
        <a href={`mailto:${email}`} alt={email}>{ email }</a></div>
    {/if}

    {#each socials as social}
      <div class={`${social.type}`}>
        <i class={`_font-phage icon-${social.type}`}/>
        <a href={social.url} alt={social.type}>{ social.username }</a>
      </div>
    {/each}
  {:else} -->

  {#if showFullLinks}

    {#if email}
      <span class="Email">
        <a class="{linkClass}" href={`mailto:${email}`} alt={email}><Icon class={iconClass} icon="tabler:mail" /><span class="px-2">{email}</span>
        </a>
      </span>
    {/if}

    {#each socials as social}
      <!-- {JSON.stringify(social)} -->
      <span class={`${social.type}`}>
        <a class="{linkClass}" href={social.url} alt={social.type}><Icon class={iconClass} icon="{iconMap[social.type]||`mdi:${social.type}`}" /><span class="px-2">{social.url}</span>
        </a>
      </span>
    {/each}

  {:else}
    {#if email}
      <span class="Email">
        <a class="{linkClass}" href={`mailto:${email}`} alt={email}><Icon class={iconClass} icon="tabler:mail" />{#if showText}<span class="px-2">{email}</span>{/if}
        </a>
      </span>
    {/if}

    {#each socials as social}
      <span class={`${social.type}`}>
        <a class="{linkClass}" href={social.url} alt={social.type}><Icon class={iconClass} icon="{iconMap[social.type]||`mdi:${social.type}`}" />{#if showText}<span class="px-2">{social.username}</span>{/if}
        </a>
      </span>
    {/each}
  {/if}

  <!-- {/if} -->

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