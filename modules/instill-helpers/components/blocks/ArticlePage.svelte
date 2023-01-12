<!-- 

  Article

  single article on w/ comments

  - article uses the first Topic it can find as the root article
  - comments are the same as the Comments component
  - how to create / edit article
 -->


<div class="ArticlePage">

  {#if topic}

    {#if topic.ImageUrl}
      <div class="ArticlePage-cover | mt-8">
        <img class="w-full max-h-96	object-cover " src="{topic.ImageUrl}" alt="{topic.Topic}" />
      </div>
    {/if}
    <article class="prose prose-stone prose-lg | mt-8 mx-auto">
      {#if topic.id}
        <span class="topic-date">{niceDate(topic.Created)}</span> ∙ <span class="topic-user">{topic.Username || 'Anonymous'}</span>
      {/if}
      <h1 class="pt-4 pb-0">{topic?.Topic}</h1>
      {#if topic?.Json?.Description}
        <div class="topic-description | mb-8">{@html marked(topic?.Json?.Description)}</div>
      {/if}
      {@html marked(topic.Comment || '')}
    </article>

    <CommentList classes="mt-8" ></CommentList>
  {:else}
    <div class="Comments-add mb-8">
      <AddComments isTopic={true} ></AddComments>
    </div>
  {/if}

</div>



<script>
  import { niceDate } from '$plasmid/utils/date'
	import { getContext } from 'svelte';
  import { marked } from 'marked';

  import AddComments from '$instill-helpers/components/AddComments.svelte';
  import CommentList from '$instill-helpers/components/blocks/CommentList.svelte'; // basic comment component


  marked.setOptions({
    gfm: true,
    breaks: true,
    smartypants: true,
  });

  let _context = getContext('space')
  let {_comments, _allComments, _space, _topic} = _context
  let topic = _topic

  // $: console.log('--->', $_allComments, topic)

  // articlepages use the space's first topic as the article
  // it doesn't use a topic id / slug like post lists
  // articlepages' comments also don't have parents, unless a direct response
  // find the first topic in the space / comments if it's not given
  if(!topic) { 
    // useful for populating single-offs 
    topic = $_allComments.find(cm => cm.Topic)
  }


</script>