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

      {#if showUpvoting}
        <div class="PostPage-upvote ">
          <Upvote />
        </div>
      {/if}

      <!-- top row -->
      <div class="PostPage-main | flex-1">
        {#if topic.id}
          <div class="PostPage-header my-2 text-sm">
            <span class="topic-date">{niceDate(topic.Created)}</span> ∙ <span class="topic-user">{topic.Username || 'Anonymous'}</span>
          </div>
        {/if}
        {#if url}
          <div class="PostPage-link my-4 text-xl">
            <a href="{url}" class="">{topic?.Topic}</a><br><span class="text-xs text-gray-500">{url}</span>
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

        {@html marked(topic.Comment || '')}

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
	import { enhance } from '$app/forms';
  import { niceDate } from '$plasmid/utils/date'
	import { getContext } from 'svelte';
  import { marked } from 'marked';
  import { commentUser } from '$instill/instill-store'
  import {getEventsOfType, getEventsCount} from '$instill-helpers/instill-utils'


  import ArrowUpCircle from '$plasmid/components/icons/arrow-up-circle.svelte'
  import Upvote from '$instill-helpers/components/Upvote.svelte';
  import AddComments from '$instill-helpers/components/AddComments.svelte';
  import CommentList from '$instill-helpers/components/blocks/CommentList.svelte'; // basic comment component
  import PollBlock from '$instill-helpers/components/blocks/PollBlock.svelte'; // basic comment component

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
  let comment = $commentUser;
  
  // $: console.log('PostPage -----^>', $_allComments, topic);

  // articlepages use the space's first topic as the article
  // it doesn't use a topic id / slug like post lists
  // articlepages' comments also don't have parents, unless a direct response
  // find the first topic in the space / comments if it's not given
  if(!topic) { 
    // useful for populating single-offs 
    topic = $_allComments.find(cm => cm.Topic);
  }


</script>