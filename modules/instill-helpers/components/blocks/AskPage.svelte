<!-- 

  Post

  single post on w/ comments

  - similar to article page
  - HN style comments


 -->

<div class="AskPage">

  {#if topic}
    <div class="AskPage-content mt-8">
      {#if topic.id}
        <div class="AskPage-header my-2 text-sm">
          <span class="topic-date">{niceDate(topic.Created)}</span> ∙ <span class="topic-user">{topic.Username || 'Anonymous'}</span>
        </div>
      {/if}

      {#if topic?.Topic}
        <div class="AskPage-link my-4 text-xl">
          {topic?.Topic}
        </div>
      {/if}

      {#if url}
        <div class="AskPage-link my-4 text-sm">
          <a href="{url}" class="">{url}</a>
        </div>
      {/if}

      {#if topic.ImageUrl}
        <!-- add topic.ImageUrl as image -->
        <div class="AskPage-image | mb-4">
          <img src="{topic.ImageUrl}" alt="{topic.Topic}"/>
        </div>
      {/if}
      
      {@html marked(topic.Comment || '')}

      {#if answers && answers.length > 0}
        <div class="AskPage-answers | Card-lighter">
          <h3 class="pt-0">Marked Answer{#if answers.length>1}s{/if}</h3>
          {#each answers as answer}
            <!-- <div class="AskPage-answer | my-4">{JSON.stringify($_comments, answer.id)}</div> -->
            <!-- <div class="AskPage-answer | my-4">{JSON.stringify(findCommentById($_comments, answer.id))}</div> -->
            <Comment comment={findCommentById($_comments, answer.id)} ></Comment>
          {/each}
        </div>
      {/if}

<!-- 
      {#if topic?.Json?.Poll}
        <PollBlock poll={topic?.Json?.Poll} {topic} {_space} />
      {/if} -->

    </div>
    <CommentList classes="mt-8" showHeader={false} ></CommentList>
  {:else}
    <div class="Comments-add mb-8">
      <AddComments isTopic={true} commentLabel={false}></AddComments>
    </div>
  {/if}

</div>




<script>
  import { niceDate } from '$plasmid/utils/date'
	import { setContext, getContext } from 'svelte';
  import { marked } from 'marked';
  import {getEventsOfType, findCommentById} from '$instill-helpers/instill-utils'

  import Comment from '$instill-helpers/components/Comment.svelte';
  import AddComments from '$instill-helpers/components/AddComments.svelte';
  import CommentList from '$instill-helpers/components/blocks/CommentList.svelte'; // basic comment component
  import PollBlock from '$instill-helpers/components/blocks/PollBlock.svelte'; // basic comment component

  marked.setOptions({
    gfm: true,
    breaks: true,
    smartypants: true,
  });

  let _context = getContext('space')

  // passed 
  setContext( 'blockSettings', {
    showMarkAsAnswer: true
  })
  
  let {_comments, _allComments, _space, _topic} = _context
  let topic = _topic;
  let url = topic?.Json?.url || topic.Url

  // $: console.log('AskPage -----^>', $_comments, $_allComments, topic, getEventsOfType($_comments, 'MarkAsAnswer'));
  let answers = getEventsOfType($_comments, 'MarkAsAnswer')

  // articlepages use the space's first topic as the article
  // it doesn't use a topic id / slug like post lists
  // articlepages' comments also don't have parents, unless a direct response
  // find the first topic in the space / comments if it's not given
  if(!topic) { 
    // useful for populating single-offs 
    topic = $_allComments.find(cm => cm.Topic)
  }

  // function getEventsOfType(comments, type='Vote') {
  //   let arr = []
  //   comments?.filter(cm => {
  //     let events = cm?.['Events::data']
  //     if(events) {
  //       events.filter(ev => {
  //         if(ev?.EventType == type) {
  //           arr.push({...ev, id: cm.id})
  //         }
  //       })
  //     }
  //   })
  //   return arr
  // }

  // function findCommentById(comments, id) {
  //   return comments && comments.find && comments.find(cm => cm.id == id)
  // }

</script>




<style global lang="scss">
	@import 'plasmid/themes/tw/cards.scss';
  .AskPage {
    .comment {
      @extend %card !optional;
      @extend %card--pad !optional;
      @extend %card-solid-light !optional;

      &.isAnswer { 
        @extend %card-solid-success !optional;
      }
    }
    .comment-body {
      @apply my-2;
    }
  }
</style>