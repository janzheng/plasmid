<!-- 

  Renders a Ask Stub for Lists
  
 -->


<div
  class="PostStub topic {classes} {classMode} | Card-solid --hoverbox --btn --negative px-4 py-1 relative" id={topic.id}
  >
  
  <div class="topic-header | flex">
    <div class="topic-main | flex-1 relative">
      <h2 class="topic-title | inline-block relative z-10">

        <!-- {#if answers}
          <span class="comment-isAnswer | text-green-900"><CircleCheck size={21} strokeColor="#14532D" /></span>
        {/if} -->

        <a class="topic-linkout" on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{link}">{topic.Topic}</a>
        {#if linkOrigin}<a class="topic-linkorigin | text-slate-400" href="{linkOriginUrl.host}">({linkOriginUrl.host})</a>{/if}
      </h2>
      <!-- {@html marked(topic.Name || '')} -->

      {#if loud}
        <div class="topic-debug | Card-light p-1">
          [Post Stub: /{topic.Slug}]
          <br>Post type: {topic.PostType}
        </div>
      {/if}

      <div class="topic-meta | relative z-10">

        {#if showSpace}
          <span class="topic-space | Btn --tag text-xs text-gray-600 border-gray-400 | mr-1 ">
            {_space?.name || ""} 
          </span>
        {/if}
        {#if topic?.PostType }
          <span class="topic-type | Btn --tag text-xs text-gray-600 border-gray-400 | mr-1 ">
            {topic?.PostType} 
            <!-- ∙ -->
          </span>
        {/if}
<!-- 
        {#if answers}
          <span class="comment-isAnswer | text-xs text-green-900"><CircleCheck size={21} strokeColor="#14532D" />Answered by </span>
        {/if} -->

        {#if answers && answers.length>0}
          <span class="comment-isAnswer | Btn-outline --tag --success text-xs text-green-900 mr-2"><CircleCheck strokeWidth={3} size={12} bottom={1} strokeColor="#7CC597" />Answered by {getAnswerAuthors(answers)?.join(', ')}</span>
        {/if}

        <span class="topic-user">
          {#if topic.Username}
            <a class="topic-userlink" href="{baseUrl}/profiles/{topic.Username}" on:click|stopPropagation={''} on:dragend|stopPropagation={''}>{topic.Username}</a>
          {:else}
            Anonymous
          {/if}
        </span>
        {#if topic.id}
          <span class="topic-date">∙ {dateTo(topic.Created)}</span>
        {/if}
        <span class="topic-comment-count">∙ <a class="topic-commentlink" on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{baseUrl}/spaces/{topic.Space}/{topic.Slug}">{commentCount} comments</a></span>
      </div>

      {#if topic?.Json?.description}
        <div class="topic-description | text-sm text-gray-600">
          {topic?.Json?.description}
        </div>
      {/if}
      
      {#if previewLength && previewLength > 0 && previewComment}
        <div class="topic-preview">
          {#if previewMode == 'markdown'}
            {@html marked(previewComment || '')}
          {:else}
            {previewComment}
          {/if}
        </div>
      {/if}

    </div>

    {#if topic.ImageUrl}
      <div class="topic-aside">
        <a on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{baseUrl}/spaces/{topic.Space}/{topic.Slug}">
          <img class="topic-cover h-32" src="{topic.ImageUrl}" alt="{topic.Topic}" />
        </a>
      </div>
    {/if}

  </div>

  <a class="topic-bg-link | " on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{link}">{topic.Topic}</a>
  <!-- </a> -->
</div>




<script>
  import { goto, preloadData } from '$app/navigation';
	import { page } from '$app/stores';
  import { dateTo } from '$plasmid/utils/date'
  import { marked } from 'marked';
  import CircleCheck from '$plasmid/components/icons/circle-check.svelte'

  import {getEventsOfType, findCommentById} from '$instill-helpers/instill-utils'

  export let topic, comments=[]
  let url = topic?.Json?.url || topic.Url
  export let link = `${$page.url.pathname}/${topic.Slug}` // link never lead out
  let linkOrigin = url ? new URL(url).hostname : null
  let linkOriginUrl = url ? new URL(url) : null
  let postType = topic?.PostType

	import { getContext } from 'svelte';
  let _context = getContext('space')
  let { baseConfig } = _context

  export let space = null; // pass it in from Profiles stub here
  export let showSpace = true;
  let _space = _context?._space || space || {}
  let loud = _space?.settings?.loud || false
  export let classes = ''
  export let classMode = _space?.settings?.classMode || 'default'
  let answers = getEventsOfType(comments, 'MarkAsAnswer')

  export let postTypeSettings = _space?.settings?.postTypeSettings?.[postType] || {}
  export let previewLength = postTypeSettings?.preview?.length == 'full' ? 20000 : postTypeSettings?.preview?.length == 'long' ? 400 : postTypeSettings?.preview?.length == 'short' ? 100 : 0
  export let previewMode = postTypeSettings?.preview?.mode
  export let previewComment = null

  let baseUrl = baseConfig.base_url || '/instill';



  if (previewLength && previewLength > 0) {
    previewComment = topic?.Comment.substring(0, previewLength - 3) + "..." 

    if(previewMode == 'markdown') {
      previewComment = marked(previewComment)
    }
    // console.log('previewComment', previewComment)
  }

  export let commentCount = 0;

  // $: console.log('poststub topic???', topic)

  $: if(comments && comments?.length && comments.length > 0) {
    commentCount = comments?.length;
    // console.log('----askstub comments', comments, 'answers', answers)
  }

  function getAnswerAuthors(answers) {
    // answers either come in the form: answer.Username or Answer.JsonArr.arr[0].Username
    // this builds an array of all the authors of the answers into a single list or user names
    let authors = []
    answers.forEach(answer => {
      if(answer.Username) {
        authors.push(answer.Username)
      } else if(answer.JsonArr && answer.JsonArr.arr && answer.JsonArr.arr[0] && answer.JsonArr.arr[0].Username) {
        authors.push(answer.JsonArr.arr[0].Username)
      }
    })

    // cleanup
    // get unique authors
    authors = [...new Set(authors)]
    // filter out "arrayed" keyword from authors
    authors = authors.filter(author => author != 'arrayed')

    // console.log('answer authors:', authors)
    return authors
  }

</script>






<style lang="scss">

  %default {
    // default
    @apply my-4;
    
    .topic-title {
      @apply pt-0 pb-2;
    }
    .topic-cover {
      @apply h-32;
    }
    .topic-linkorigin {
      @apply pt-0 pb-1 text-base;
    }
    .topic-meta {
      @apply w-fit;
    }
  }


  %tight {
    @apply my-1;

    @apply text-base;
    .topic-header {
      @apply items-center;
    }
    .topic-title {
      @apply pt-0 pb-1 text-lg;
    }
    .topic-meta {
      @apply pt-0 pb-0 text-sm w-fit;
    }
    .topic-linkorigin {
      @apply pt-0 pb-1 text-sm;
    }
    .topic-preview {
      @apply pt-2 pb-2;
    }
    .topic-cover {
      @apply h-16;
    }
  }

  %oneline {
    @extend %tight;
    .topic-title, .topic-meta {
      @apply inline w-fit;
    }
    .topic-cover {
      @apply h-8;
    }
    .topic-header {
      @apply items-center;
    }
  }









  .topic {
    &.default {
      @extend %default;
    }

    &.tight {
      @extend %tight
    }

    &.oneline {
      @extend %oneline;
    }

  }
  
  .topic-bg-link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    opacity: 0;
    height: 100%;
  }
</style>