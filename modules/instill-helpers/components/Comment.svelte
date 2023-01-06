
<div class="comment-container {classes||''} " >
  <div class="comment | {eventsMarkedAsAnswer ? 'isAnswer' : ''} | mb-4" id={comment.id}>

    <div class="comment-header">
      {#if eventsMarkedAsAnswer}
        <span class="comment-isAnswer | text-green-900"><CircleCheck strokeColor="#14532D" />Marked as Answer ∙ </span>
      {/if}
      <span class="comment-user">{comment.Username || 'Anonymous'}</span>
      {#if comment.id}
        <span class="comment-date">∙ {dateTo(comment.Created)}</span>
      {:else}
        <span class="comment-saving">∙ <em>Saving...</em></span>
      {/if}

      {#if comment?.PostStatuses?.includes('Edited')}
        <span class="comment-edited">∙ Edited {dateTo(comment.Edited)}</span>
      {/if}

      {#if comment.id && editPosts && 
        $isUserLoggedIn && $commentUser.Username == comment.Username
      }∙ <button class="Btn-link-light inline-block border-0" on:click={()=>{closeReplyModes(); openEdit=true}} >edit post</button>{/if}

      {#if mode=="linear" && commentParent}
        ∙ <a class="comment-reply-to" href="#{commentParent.id}">Replying to {commentParent.Username || 'Anonymous'}{#if loud} - {commentParent.id}{/if}</a>
      {/if}
      {#if showHide }
        {#if showHide && !showComment }
          ∙ 
          <button class="Btn-link-light inline-block border-0" on:click={()=>{showComment=true; openComments=true}}>
            [show {allChildren?.length + 1} more]
            <!-- [show] -->
          </button>
        {:else}
          ∙ 
          <button class="Btn-link-light inline-block border-0" on:click={()=>{showComment=false; openComments=false}}>[hide]</button>
        {/if}
      {/if}
    </div>

    <div class="comment-body | {showHide && !showComment ? 'hidden' : ''}">
      {#if loud}
        <div class="font-xs">
          depth: {depth} ∙ showHide: {showHide} ∙ showDepth: {showDepth} ∙ cmp: {depth <= showDepth} ∙ showComment: {showComment} ∙ openComments: {openComments}
          <div>{comment.Name} | votescore: {eventsVoteScore} | votecount: {eventsVoteCount} | marked: {eventsMarkedAsAnswer}</div>
        </div>
        <pre class="font-xs">Comment body: {JSON.stringify(comment, 0, 2)}
        </pre>
      {/if}
      <div>{comment.Comment}</div>
    </div>

    <div class="comment-footer">
      {#if showMarkAsAnswer && !eventsMarkedAsAnswer}<button class="Btn-link inline-block border-0 |" on:click={()=>{closeReplyModes(); openMarkAnswer=true}}><CircleCheck strokeColor="#2563EB" />Mark as Answer</button><span>&nbsp;∙</span>{/if}
      {#if comment.id && showComment && showReplyButton}<button class="Btn-link inline-block border-0" on:click={()=>{closeReplyModes(); openReply=true}}>Reply</button>{/if}
      <!-- {#if comment.id}<button class="Btn-link inline-block border-0" on:click={()=>openEdit=!openEdit}>Edit</button>{/if} -->
    </div>

    
    {#if comment.id && showComment && openReply}
      <!-- this check is to prevent replying to fake / optimistic update replies, which don't have IDs -->
      <div class="comment-reply | mt-4">
        <AddComments bind:openReply={openReply} parentComment={comment} commentLabel={false}></AddComments>
      </div>
    {/if}

    <!-- comment editing -->
    {#if comment.id && openEdit}
      <!-- this check is to prevent replying to fake / optimistic update replies, which don't have IDs -->
      <div class="comment-edit | mt-4">
        <AddComments 
          useOptimistic={false}
          commentLabel={false}
          on:success={()=>{closeReplyModes();}}
          initComment={{...comment, "RecordId":comment.id, "PostStatuses": 'Edited', }}
        />
      </div>
    {/if}

    <!-- todo: move to own component -->
    {#if openMarkAnswer}
      <MarkAsAnswer topic={comment} />
    {/if}

  </div>
  <!-- render threaded children -->
  <!-- mod: {mode} -->
  {#if mode=="threaded" && showHide && showComment}
    <div class="comment-children">
      {#each childComments as comment}
        {@const _parent = filterFind($_allComments, "id", comment?.Parent[0])}
        {#if loud}<pre class="font-xs">{JSON.stringify(_parent, 0, 2)}</pre>{/if}
        <!-- passing in showComment and openComments opens the entire thread up -->
        <Comment classes={"ml-8"} {comment} showComment={openComments?openComments:undefined} {openComments} depth={1+depth}></Comment>
      {/each}
    </div>
  {/if}
</div>





<script>

	import { getContext } from 'svelte';
  import { isUserLoggedIn, commentUser } from '$instill/instill-store';
  // import { currentComments } from '$instill/instill-store'

  import AddComments from './AddComments.svelte';
  import MarkAsAnswer from './MarkAsAnswer.svelte';
  import Comment from './Comment.svelte';
  import { dateTo } from '$plasmid/utils/date'
  import { filterFind } from '$plasmid/utils/filterby'
  import CircleCheck from '$plasmid/components/icons/circle-check.svelte'

  export let comment, depth=0, classes=''

  let _context = getContext('space')
  let _blockSettings = getContext('blockSettings')
  let {_comments, _allComments, _space, _topic} = _context ? _context : {}
  
  // export let space = _space

  export let loud = _space?.settings?.loud;
  // export let type = 'Comments';
  export let mode = _space?.settings?.Comments?.mode || 'threaded';
  export let showDepth = _space?.settings?.Comments?.showDepth || 2; // 1 means we show root and one deep
  export let showHide = _space?.settings?.Comments?.showHide == false ? false : true; // if true, shows the [show 1 more] feature, or turn it off completely (for chat)
  export let editPosts = _space.settings.editPosts == false ? false : true;
  export let showReplyButton = true; //  = _space?.settings?.Comments?.mode == 'linear' ? false : true; // still allow for replies

  // console.log('----???', _space.settings, _space.settings?.Comments)

  let openReply = false;
  let openMarkAnswer = false;
  let openEdit = false;

  export let openComments = false;
  export let showComment = depth <= showDepth || openComments;
  export let showMarkAsAnswer = _blockSettings?.showMarkAsAnswer;
  // let showComment = depth -1 == showDepth ? false : true // using <= will force you to show every depth

  export let commentParent;
  export let childComments;
  export let allChildren = [];
  $: if($_allComments) {
    commentParent = filterFind($_allComments, "id", comment?.Parent?.[0])
    childComments = $_allComments.filter(cm => cm?.Parent?.includes(comment?.id))
    allChildren = getAllChildren(comment, $_allComments)
  }
  export let eventsArr
  export let eventsVoteCount
  export let eventsVoteScore
  export let eventsMarkedAsAnswer

  $: if(comment) {
    eventsArr = comment?.['Events::data']

    if(eventsArr) {
      // count all votes from eventsArr
      eventsVoteCount = eventsArr.filter(ev => ev?.EventType == 'Vote').length
      // count all eventsVoteScore from eventsArr
      eventsVoteScore = eventsArr.filter(ev => ev?.EventType == 'Vote').reduce((acc, ev) => acc + ev?.Data, 0)
      eventsVoteCount = eventsArr.filter(ev => ev?.EventType == 'Vote').length
      // eventsMarkedAsAnswer = eventsArr.filter(ev => ev?.EventType == 'MarkAsAnswer').length > 0
      eventsMarkedAsAnswer = eventsArr.filter(ev => ev?.EventType == 'MarkAsAnswer').length
  
      if(eventsMarkedAsAnswer) showMarkAsAnswer = false // don't show Mark as Answer CTA if already marked
    } else {
      eventsVoteScore = 0
      eventsVoteCount = 0
      eventsMarkedAsAnswer = 0
    }
  }

  // console.log(comment.Name, comment, 'votescore:', eventsVoteScore, 'votecount:', eventsVoteCount, 'marked:', eventsMarkedAsAnswer)

  function getAllChildren(comment, comments) {
    let kids = comments.filter(cm => cm?.Parent?.includes(comment?.id))
    kids.forEach(kid => {
      kids = kids.concat(getAllChildren(kid, comments))
    })
    return kids
  }

  function closeReplyModes() {
    openReply = false
    openMarkAnswer = false
    openEdit = false
  }
</script>

<!-- preload tailwinds lol -->
<span class="hidden ml-4 ml-8 ml-12 ml-16 ml-20 ml-24 ml-28"></span>