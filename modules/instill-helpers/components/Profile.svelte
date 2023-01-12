

<div class="Profile Profile-container | relative text-lg ">
  {#if profile['CoverImage:URL']}
    <div class="Profile-cover | -mb-24 w-full">
      <img src="{profile['CoverImage:URL']}" alt="{profile.Name} cover" />
    </div>
  {/if}

  <div class="_content-narrow">
    <div class="Profile-profile ">

      <ProfileAvatar user={profile} size='lg' />
      <!-- <img class="w-40 object-cover rounded-full border-4 border-white" src="{profile['ProfileImage:URL'] || '/instill_icon.png'}" alt="{profile.Name} profile" /> -->
      <!-- {/if} -->
    </div>

    <h1 class="Profile-name pt-4 | text-4xl">{profile.Name}</h1>

    {#if hasSocial}<div class="Profile-social mb-4">
      {#if profile.Website}<a class="inline-block pr-4" href="{profile.Website}"><span class="relative bottom-[2px]"><Globe/></span>Website</a>{/if}
      {#if profile.Linkedin}<a class="inline-block pr-4" href="{profile.Linkedin}"><span class="relative bottom-[2px]"><Linkedin/></span>Linkedin</a>{/if}
      {#if profile.Twitter}<a class="inline-block pr-4" href="{profile.Twitter}"><span class="relative bottom-[2px]"><Twitter/></span>Twitter</a>{/if}
    </div> {/if}

    {#if profile.Short}<div class="mb-8">
      <div class="Profile-description mt-2 | Card-light p-2 mb-4">
        {@html marked(profile.Short)}
      </div></div> {/if}
    {#if profile.Description}<div class="Profile-description mt-2">
      {@html marked(profile.Description)}
    </div> {/if}

    {#if browser && profile.NotionBlockId}
      <div class="Profile-Notion _margin-center | mt-8">
        <Notion api={env.PUBLIC_NOTION_API_URL} loadingMsg='Loading more...' id={profile.NotionBlockId} classes={''} />
      </div>
    {/if}

    {#if topics?.length > 0}
      <div class="Profile-Topics _margin-center | mt-8">
        <h2>Topic submissions</h2>
        {#each topics.sort((a,b) => new Date(b.topic.Created) - new Date(a.topic.Created)) as topicObj}
          {@const topic = topicObj.topic}
          {@const commentCount = topicObj.commentCount}
          {@const url = topic?.Json?.url || topic.Url}
          {@const link = url ? `${url}` : `${baseUrl}/spaces/${topic.Space}/${topic.Slug}`}
          <!-- link: {link} -->
          {@const space = topic?.Space ? orgSpaces?.spaces?.find(f=>[topic?.Space]) : {}}
          <svelte:component {link} {topic} {space} {commentCount} classMode='tight' this={stubType[topicObj.topic.PostType] || stubType['Post']}/>
        {/each}
      </div>
    {/if}
    
  </div>

</div>


<script>

	import { setContext, getContext } from 'svelte';
  import { env } from '$env/dynamic/public';
	// import { page } from '$app/stores';
  import { marked } from 'marked';

  import Notion from '@yawnxyz/sveltekit-notion'
  import { browser } from '$app/environment'
  import Twitter from '$plasmid/components/icons/twitter.svelte'
  import Linkedin from '$plasmid/components/icons/linkedin.svelte'
  import Globe from '$plasmid/components/icons/globe.svelte'
  import ProfileAvatar from '$instill-helpers/components/ProfileAvatar.svelte';

  // import { filterFind } from '$plasmid/utils/filterby'

  import PostStub from '$instill-helpers/components/blocks/PostStub.svelte';
  import AskStub from '$instill-helpers/components/blocks/AskStub.svelte';
  import PollStub from '$instill-helpers/components/blocks/PollStub.svelte';

  let { baseConfig, orgSpaces } = getContext('config')

  console.log('Profile.svelte config', getContext('config'))
  // required to render Instill components within profile
  // WARNING: some functionality like Upvote route won't really work w/ this hack
  setContext( 'space', {
    baseConfig
  })

  export let stubType = {
    // Article: ArticleStub, // dynamic list for all posts articles, polls, posts
    Article: PostStub, // dynamic list for all posts articles, polls, posts
    Ask: AskStub, // dynamic list for all posts articles, polls, posts
    Poll: PollStub, // dynamic list for all posts articles, polls, posts
    Post: PostStub, // generic post
    CommentList: PostStub, // list of comments, without a topic / thread / post above it
  }


  export let profile = {}
  export let topics = {}
  let baseUrl = `${baseConfig?.base_url}`

  // console.log('profile topics:', topics)

  export let hasSocial
  $: if(profile) hasSocial = profile.Website || profile.Twitter || profile.Linkedin



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

  .Profile {
    .notion-page {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }
</style>