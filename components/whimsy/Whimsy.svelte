<script>
  import marked from 'marked';
  import { stores } from '@sapper/app'
  import Notion from '@yawnxyz/svelte-notion'
  // import Notion from '../../../../../../svelte-notion/src/Notion.svelte'  
  
  
	import { _get, _find, Project, toNotionImageUrl } from "@/stores/whimsy"
	import { headConstructor } from '@/_project/head.js';
	import SocialBox from '../widgets/profile/SocialBox.svelte'
	import { socialParse } from '../../_utils/social-parser.js'
  
  
  const { page } = stores()
  // slugs are things like /about
  export let project, path, slug = '/', pageBlocks = {}, socialProfiles, siteSrc

  // should be a page endpoint
  // support collections in the future
  let projPage = _get(slug)
  let _css = _find('_css')
  let _title = _find('_title')
  let _head = _find('_head') // this overrides the other stuff
  let _icon = _find('_icon') && _find('_icon')['Files'] && _find('_icon')['Files'][0] ? _find('_icon')['Files'][0]['url'] : undefined
  let _cover = _find('_share-img') && _find('_share-img')['Files'] && _find('_share-img')['Files'][0] ? _find('_share-img')['Files'][0]['url'] : undefined
  let _showPageCover = _find('_show-page-cover')._value == 'True'
  let head

  $: if(process.browser && process.status == 'Preview') {console.log('WHIMSY', 'proj:', projPage, project, 'slug:',slug, 'icon:', _icon && _icon.includes('http') ? _icon : '/pdn-logo.png')}
  $: if(process.browser) {console.log('Page blocks:', pageBlocks)}

  $: if(projPage) {
    if(!_icon && projPage['format'] && projPage['format']['page_icon']) {
      _icon = toNotionImageUrl(projPage['format']['page_icon'], projPage.id, siteSrc)
    }
    if(!_cover && projPage['format'] && projPage['format']['page_cover']) {
      _cover = toNotionImageUrl(projPage['format']['page_cover'], projPage.id, siteSrc)
    }

    head = headConstructor({
      site_title: _find('_title')['_value'], 
      site_url: `https://${$page.host}`,
      // description:,
      site_ico: _icon && _icon.includes('http') ? _icon : '/pdn-logo.png',
      site_image: _cover,
      // author, 
      // twitterCreator, // author's twitter
      // twitterCard,
      // meta,
    })

    if(projPage.Social)
      socialProfiles = socialParse(projPage.Social)
  } 


  // let dummy = `
  //   h1 { 
  //     color: red !important;
  //   }

  // `

</script>


<svelte:head>
	{#if head}
		<title>{ head.title || projPage['Name'] }</title>
		{#if head.link}
			{#each head.meta as meta}
				<meta 
					charset={meta.charset}
					data-hid={meta.hid} 
					name={meta.name} 
					content={meta.content} 
					property={meta.property} 
				>
			{/each}
			{#each head.link as link}
				<link data-hid={link.hid} rel={link.rel} href={link.href}>
			{/each}
		{/if}
	{/if}
  {#if _head && _head._value}{
    @html `${_head._value}`}
  {/if}
</svelte:head>




{#if $Project}
  <div class='whimsy whimsy-{path||slug} whimsy-{project['_projectType']} _section-page _section-notion _margin-top _margin-center _divider-bottom'>
    {#if projPage && projPage.id}

      <!-- user profile, like phage.ca -->
      {#if project && project['_projectType'] == 'Profile'}
        {#if _cover || _icon}
          <div class="whimsy-cover-profile">
            {#if _cover}
              <div class="whimsy-cover">
                <img src="{_cover}" alt="{projPage.name}'s cover image"/>
              </div>
            {/if}
            {#if _icon}
              <div class="whimsy-profile-container">
                <div class="whimsy-profile">
                  {#if _icon.includes('http')}
                    <img src="{_icon}" alt="{projPage.name}'s profile image"/>
                  {:else}
                    <span class="_emoji _font-9">{_icon}</span>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <div class="whimsy-description _divider-bottom">
          <div class="whimsy-name"><h1>{projPage.Name || '(no name)'}</h1></div>
          <!-- <div class="whimsy-slug">@{project['_path']}</div> -->
          <div class="whimsy-description-details _grid-2-1">
            {#if projPage.Short}
              <div class="whimsy-short">{@html marked(projPage.Short||'')}</div>
            {/if}
            {#if projPage.Social}
              <div class="whimsy-social _padding _card">
                <SocialBox email={projPage['Public Email']} socialProfiles={socialProfiles} />
              </div>
            {/if}
          </div>
        </div>

        <div class="whimsy-page _margin-top">
          <Notion loadingMsg='' loud={true} classes={''} blocks={pageBlocks[projPage.id]} id={projPage.id} api={process.env.NOTION_API} />
        </div>
      {:else}






        <!-- standard project page -->
        {#if _cover && _showPageCover}
          <div class="whimsy-cover-page">
            {#if _cover}
              <div class="whimsy-cover">
                <img src="{_cover}" alt="{projPage.name}'s cover image"/>
              </div>
            {/if}
          </div>
        {/if}

        <div class="whimsy-page _margin-top">
          <Notion loadingMsg='' loud={true} classes={''} blocks={pageBlocks[projPage.id]} id={projPage.id} api={process.env.NOTION_API} />
          <!-- <Notion loadingMsg='' classes={''} blocks={pageBlocks[projPage.id]} id={projPage.id} api={process.env.NOTION_API} /> -->
        </div>

      {/if}
    {:else}
      <h1>No page found at /{slug}</h1>
    {/if}
    
  </div>

{:else}
  <div class='_section-page _margin-center _divider-top _divider-bottom'>
    <h1>No project found</h1>
  </div>
{/if}


<!-- inject styles -->
{#if _css && _css._value}
  {@html `<style>${_css._value}</style>`}
{/if}