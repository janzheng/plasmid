

<div class="ShowComments pb-16">
  {#if loud}
    ShowComments
    <br>sort: {sort}
  {/if}

  {#if commentsArr?.length > 0}
    {#each commentsArr as comment}
      <Comment {comment} ></Comment>
    {/each}
  {:else}
    No comments yet. Be the first to comment!
  {/if}

</div>





<script>

	import { getContext } from 'svelte';
  import Comment from './Comment.svelte';

  let _context = getContext('space')
  let {_comments, _allComments, _space, _topic} = _context
  
  export let loud = _space?.settings?.loud
  export let parentComment=null, comments, space

  // export let comments, space
  export let type = 'Comments'
  export let sort
  export let mode
  let commentsArr

  $: {
    parentComment = _topic
    comments = $_allComments
    space = _space
    sort = space?.settings?.[type]?.sort || 'latest'
    mode = space?.settings?.[type]?.mode || 'threaded'
  }

  
  // $: if(!comments) { // if not topics given, get it from the space
  //   commentsArr = $currentComments
  // } else {
    // commentsArr = comments // feed comments for a topic, etc.
  // }

  $: if(comments) {
    commentsArr = comments || []
    
    if(mode == 'threaded') {
      commentsArr = commentsArr?.filter(cm => !cm.Parent) // don't show replies for threaded mode
    }
    commentsArr = commentsArr?.filter(cm => !cm.TopicId)  // don't show thread starters

    if (sort == 'latest') {
      commentsArr = commentsArr?.sort((a,b) => new Date(b.Created) - new Date(a.Created))
    }

    // console.log('[ShowComments] commentsArr', commentsArr)
  } 

</script>

