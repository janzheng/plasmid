<!-- 

  Renders an Article Stub for Lists

  UNUSED
  
 -->


<div class="ArticleStub mt-8 mb-8" id={topic.id}>
  
  <!-- {@html marked(topic.Name || '')} -->

  <div class="topic-header | flex">
    <div class="topic-main | flex-1">
      <h2 class="pt-0 pb-2">
        <a href="{baseUrl}/spaces/{topic.Space}/{topic.Slug}">{topic.Topic}</a>
      </h2>
      {#if topic?.Json?.Description}
        <div class="topic-description">{@html marked(topic?.Json?.Description)}</div>
      {/if}
      <span class="topic-type">
        {topic?.PostType} ∙
      </span>
      <span class="topic-user">{topic.Username || 'Anonymous'}</span>
      {#if topic.id}
        <span class="topic-date">∙ {dateTo(topic.Created)}</span>
      {/if}
      <span class="topic-comment-count">∙ <a href="{baseUrl}/spaces/{topic.Space}/{topic.Slug}">{commentCount} comments</a></span>
    </div>
    {#if topic.ImageUrl}
      <div class="topic-aside">
        <a href="{baseUrl}/spaces/{topic.Space}/{topic.Slug}">
          <img class="w-xs h-32	 " src="{topic.ImageUrl}" alt="{topic.Topic}" />
        </a>
      </div>
    {/if}
  </div>


  {#if loud}
    <div class="Card-light p-1">
      [Article Stub: /{topic.Slug}]
      <br>Post type: {topic.PostType}
    </div>
  {/if}

</div>







<script>
  
	import { page } from '$app/stores';
  import { dateTo } from '$plasmid/utils/date'
  import {marked} from 'marked';

  export let topic, comments

	import { getContext } from 'svelte';
  let _context = getContext('space')
  let { baseConfig } = _context

  export let space // pass it in from Profiles stub here
  let _space = _context?._space || space || {}
  let loud = _space?.settings?.loud || false
  let baseUrl = baseConfig.base_url || '/instill';


  let commentCount

  $: {
    commentCount = comments?.length
  }

</script>