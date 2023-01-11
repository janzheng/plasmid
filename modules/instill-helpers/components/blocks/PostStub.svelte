<!-- 

  Renders a Post Stub for Lists
  
 -->

<!-- <div
  class="PostStub topic {classes} {classMode} {showUpvoting ? 'flex flex-row gap-4' : ''} | Card-solid --hoverbox --btn --negative px-4 py-1 relative" id={topic.id}
  on:click|preventDefault={()=>{if(!window.getSelection().toString())goto(link);}} 
  on:keyup|preventDefault={()=>{if(!window.getSelection().toString())goto(link);}} 
  on:hover={()=>{preloadData(link)}}
  > -->
<div
  class="PostStub topic {classes} {classMode} {showUpvoting ? 'flex flex-row gap-4' : ''} | Card-solid --hoverbox --btn --negative px-4 py-1 relative" id={topic.id}
  >

  {#if showUpvoting}
    <div class="PostStub-upvote | z-40 ">
      <Upvote {topic} />
    </div>
  {/if}
  
  <div class="topic-header | flex">
    <div class="topic-main | flex-1 relative">
      <h2 class="topic-title | inline-block relative z-10">
        <a class="topic-linkout z-40" on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{link}">{topic.Topic}</a>
        {#if linkOrigin}<a class="topic-linkorigin | text-slate-400" href="{linkOriginUrl.host}">({linkOriginUrl.host})</a>{/if}
      </h2>
      <!-- {@html marked(topic.Name || '')} -->

      {#if loud}
        <div class="topic-debug | Card-light p-1">
          <!-- [Post Stub: /{topic.Slug}] -->
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
        <span class="topic-user">
          {#if topic.Username}
            <a class="topic-userlink z-40" href="{baseUrl}/profiles/{topic.Username}" on:click|stopPropagation={''} on:dragend|stopPropagation={''}>{topic.Username}</a>
          {:else}
            Anonymous
          {/if}
        </span>
        {#if topic.id}
          <span class="topic-date">∙ {dateTo(topic.Created)}</span>
        {/if}
        <span class="topic-comment-count">∙ <a class="topic-commentlink z-40" on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{baseUrl}/spaces/{topic.Space}/{topic.Slug}">{commentCount} comment{#if commentCount>1}s{/if}</a></span>
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
            {#if browser && removeMd}
              {removeMd(previewComment || '')}
            {/if}
            <!-- {previewComment} -->
          {/if}
        </div>
      {/if}
    </div>

    {#if topic.ImageUrl}
      <div class="topic-aside">
        <a class="z-40" on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{baseUrl}/spaces/{topic.Space}/{topic.Slug}">
          <img class="topic-cover h-32" src="{topic.ImageUrl}" alt="{topic.Topic}" />
        </a>
      </div>
    {/if}

  </div>

  <a class="topic-bg-link | " on:click|stopPropagation={''} on:dragend|stopPropagation={''} href="{link}">{topic.Topic}</a>
</div>




<script>
  import { goto, preloadData } from '$app/navigation';
	import { page } from '$app/stores';
  import { dateTo } from '$plasmid/utils/date'
  import {marked} from 'marked';
  import { browser } from '$app/environment';
  import { removeMd } from '$plasmid/utils/remove-md.js';
  import Upvote from '$instill-helpers/components/Upvote.svelte';

  export let topic, comments=[]
  let url = topic?.Json?.url || topic.Url
  export let link = url ? `${url}` : `${$page.url.pathname}/${topic.Slug}`
  let linkOrigin = url ? new URL(url).hostname : null
  let linkOriginUrl = url ? new URL(url) : null
  let postType = topic?.PostType

	import { getContext } from 'svelte';
  let _context = getContext('space')
  let { baseConfig } = _context
  let baseUrl = baseConfig.base_url == '' ? "" : '/instill';

  export let showSpace = true;
  export let space = null; // pass it in from Profiles stub here
  let _space = _context?._space || space || {}
  let loud = _space?.settings?.loud || false
  export let classes = ''
  export let classMode = _space?.settings?.classMode || 'default'

  export let postTypeSettings = _space?.settings?.postTypeSettings?.[postType] || {}
  export let previewLength = postTypeSettings?.preview?.length == 'full' ? 20000 : postTypeSettings?.preview?.length == 'long' ? 400 : postTypeSettings?.preview?.length == 'short' ? 100 : 0
  export let previewMode = postTypeSettings?.preview?.mode
  export let previewComment = null
  export let showUpvoting = topic?.PostType == 'Suggestion'; // true; // postTypeSettings?.upvoting?.show

  if (previewLength && previewLength > 0) {
    previewComment = topic?.Comment.substring(0, previewLength - 3) + "...";

    if(previewMode == 'markdown') {
      previewComment = marked(previewComment);
    }
  }

  export let commentCount = 0;

  $: if(comments && comments?.length && comments.length > 0) {
    commentCount = comments?.length;
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
      @apply pt-0 pb-0 mb-1 text-sm w-fit;
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