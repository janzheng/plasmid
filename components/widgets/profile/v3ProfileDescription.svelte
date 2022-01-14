

<!-- {#if author && author.fields['ProfileImage'] && author.fields['ProfileImage'].length > 0} -->

{#if profile && profile.fields['ProfileImage'] && profile.fields['ProfileImage'].length > 0}
<div class="Profile-description _flex-row _margin-bottom {classes}">
  <div class="Profile-thumb">
    <!-- <a rel=preload href="/m/{profile.fields['Slug']}"> -->
      <img class="Profile-img" alt="{profile['Name']}" 
        src="{profile.fields['ProfileImage'][0]['thumbnails']['large']['url']}">
    <!-- </a> -->
  </div>
  <div class="_flex-1 _align-vertically">
    <div class="Profile-description">
      <!-- top line of profile -->
      <div class="Profile-lede _flex">
        <div class="Profile-lede-left _margin-right">
          <span class="Profile-name _truncate ">
            <!-- <a rel=preload href="/m/{profile.fields['Slug']}"> -->
              {profile.fields['Name']}{#if profile.fields['Title']},{/if}
            <!-- </a> -->
          </span>
          {#if profile.fields['Title']}
            <span class="Profile-title">{profile.fields['Title']}</span>
          {/if}
        </div>
        <div class="Profile-social _flex-1">
          {#if profile.fields['Email']}<a href="mailto:{profile.fields['Email']}" class="Dir-icon --url"><span class="_font-phage icon-mail-alt"/></a>{/if}
          {#if profile.fields['Social:Twitter']}<a href="mailto:{profile.fields['Social:Twitter']}" class="Dir-icon --url"><span class="_font-phage icon-twitter"/></a>{/if}
          {#if profile.fields['Social:Linkedin']}<a href="mailto:{profile.fields['Social:Linkedin']}" class="Dir-icon --url"><span class="_font-phage icon-linkedin"/></a>{/if}
          {#if profile.fields['Social:Github']}<a href="mailto:{profile.fields['Social:Github']}" class="Dir-icon --url"><span class="_font-phage icon-github-circled"/></a>{/if}
          {#if profile.fields['Social:GoogleScholar']}<a href="mailto:{profile.fields['Social:GoogleScholar']}" class="Dir-icon --url"><span class="_font-phage icon-google-scholar"/></a>{/if}
          {#if profile.fields['Social:ResearchGate']}<a href="mailto:{profile.fields['Social:ResearchGate']}" class="Dir-icon --url"><span class="_font-phage icon-researchgate"/></a>{/if}
          {#if profile.fields['Social:ORCID']}<a href="mailto:{profile.fields['Social:ORCID']}" class="Dir-icon --url"><span class="_font-phage icon-orcid"/></a>{/if}
          {#if profile.fields['Social:Publons']}<a href="mailto:{profile.fields['Social:Publons']}" class="Dir-icon --url"><span class="_font-phage icon-publons"/></a>{/if}
        </div>
      </div>
      <div class="Profile-details _margin-top-half">
        {#if profile.fields['Pitch']}
          <div class="Profile-pitch _truncate _margin-bottom">
            <em>{@html md.strip(md.render(profile.fields['Pitch']||''))}</em>
          </div>
        {/if}
        {#if profile.fields['Orgs::Names']}
          <div class="Profile-Orgs _truncate _margin-bottom">
            {@html md.strip(md.render(profile.fields['Orgs::Names'].join(', ')||''))}
          </div>
        {/if}
        {#if profile.fields['URL']}
          <div class="Profile-URL _truncate _margin-bottom">
            Website: {@html md.strip(md.render(profile.fields['URL']||''))}
          </div>
        {/if}
        <div class="Profile-description _margin-top">
          {@html md.render(profile.fields['Description']||'')}
        </div>
        <div class="Profile-slot _margin-top">
          <slot />
        </div>
      </div>
    </div>
  </div>
</div>
{/if}





<script>

  import { md } from '@/_utils/markdownit'

  export let profile, classes = ''

  console.log('profile:::', profile)

  // const handleClick = (e) => {
  //   // console.log('click!')
  //   // e.preventDefault()
  // }
</script>






