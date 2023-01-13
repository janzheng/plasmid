<!-- 

  Post

  single post on w/ comments

  - similar to article page
  - HN style comments


 -->

<div class="PostPage">

  {#if topic}
    <div class="PostPage-content mt-8 {showUpvoting ? 'flex flex-row gap-4' : ''}">
    <!-- <div class="PostPage-content mt-8 "> -->

      {#if isOwnerLoggedIn}
        <div class="my-8">
          <div class="Card-lighter">
            <a href="{$page.url.pathname}/edit" class="Btn-outline">Edit post</a>
          </div>
        </div>
      {/if}

      {#if showUpvoting}
        <div class="PostPage-upvote ">
          <Upvote />
        </div>
      {/if}

      <!-- top row -->
      <div class="PostPage-main mt-8 | flex-1">
        {#if topic.id}
          <div class="PostPage-header my-2 text-sm">
            <span class="topic-date">{niceDate(topic.Created)}</span> ∙ <span class="topic-user">{topic.Username || 'Anonymous'}</span>
          </div>
        {/if}
        {#if url}
          {#if topic?.Topic}
            <div class="PostPage-link my-4 text-xl">
              <a href="{url}" class="">{topic?.Topic}</a><span class="PostPage-hostname text-xs text-gray-500">{urlHost}</span>
            </div>
          {:else if topic?.Comment}
            <div class="PostPage-link my-4 text-xl">
              <div href="{url}" class="pfix">{@html marked(topic?.Comment || '')}</div><span class="PostPage-hostname text-xs text-gray-500">{urlHost}</span>
            </div>
          {/if}
        {/if}

        {#if topic.Keywords && topic.Keywords.length > 0}
          <div class="topic-keywords">
            {#each topic.Keywords as keyword}
              <!-- <a class="topic-keyword | Btn --tag text-xs text-gray-600 border-gray-400 | mr-1 " href="{baseUrl}/search?query={keyword}">{keyword}</a> -->
              <span class="topic-keyword | Btn --tag text-xs text-gray-600 bg-gray-100 | mr-1 " >{keyword}</span>
            {/each}
          </div>
        {/if}

        {#if topic.ImageUrl}
          <!-- add topic.ImageUrl as image -->
          <div class="PostPage-image | mb-4">
            <img src="{topic.ImageUrl}" alt="{topic.Topic}"/>
          </div>
        {/if}
        
        {#if topic?.Topic && !url}
          <div class="PostPage-topic my-4 text-xl">
            {topic?.Topic}
          </div>
        {/if}

        {#if !url || topic?.Topic}
          <!-- if topic exists, we want to show the comment; otherwise it's promoted up to the title -->
          {@html marked(topic.Comment || '')}
        {/if}
        
        {#if topic?.Json?.Poll}
          <PollBlock poll={topic?.Json?.Poll} {topic} {_space} />
        {/if}
      </div> 
    </div>
    <CommentList classes="mt-8" showHeader={false}></CommentList>
  {:else}
    <div class="Comments-add mb-8">
      <AddComments isTopic={true} commentLabel={false}></AddComments>
    </div>
  {/if}

</div>




<script>
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
  import { niceDate } from '$plasmid/utils/date'
	import { getContext } from 'svelte';
  import { marked } from 'marked';
  import {getEventsOfType, getEventsCount} from '$instill-helpers/instill-utils'

  import ArrowUpCircle from '$plasmid/components/icons/arrow-up-circle.svelte'
  import Upvote from '$instill-helpers/components/Upvote.svelte';
  import AddComments from '$instill-helpers/components/AddComments.svelte';
  import CommentList from '$instill-helpers/components/blocks/CommentList.svelte'; // basic comment component
  import PollBlock from '$instill-helpers/components/blocks/PollBlock.svelte'; // basic comment component


  import { commentUser } from '$instill/instill-store'
  let isOwnerLoggedIn = false
  $: if($commentUser?.isLoggedIn && $commentUser.Username == topic.Username) {
    console.log('AskPage commentUser', $commentUser, topic)
    isOwnerLoggedIn = true
  }



  marked.setOptions({
    gfm: true,
    breaks: true,
    smartypants: true,
  });

  let _context = getContext('space');
  let {_comments, _allComments, _space, _topic} = _context;
  let topic = _topic;
  export let showUpvoting = topic?.PostType == 'Suggestion';
  let url = topic?.Json?.url || topic.Url
  let urlHost = url ? new URL(url).hostname : null
  
  // $: console.log('PostPage -----^>', $_allComments, topic);

  // articlepages use the space's first topic as the article
  // it doesn't use a topic id / slug like post lists
  // articlepages' comments also don't have parents, unless a direct response
  // find the first topic in the space / comments if it's not given
  if(!topic) { 
    // useful for populating single-offs 
    topic = $_allComments.find(cm => cm.TopicId);
  }


</script>