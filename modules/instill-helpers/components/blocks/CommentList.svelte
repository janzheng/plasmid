<!-- 

  Comments

  Features
    - Threaded vs. Linear
      - threaded: Hacker News style comments (or substack, w/ auto-hidden replies?)
      - linear: Ars Technica - list of comments; can @reply to 

  Features (future)
    - Markdown
    - Images
    - @mentionspecific comments still
    - Whitelist / Blacklist / Locked to members
    - Channels
    - Paired Events (e.g. Stars, Votes, Reactions, etc.)
    - Form Data (e.g. more complex fields)

  Use Cases
    - Article / blog comments
    - Forum Topic comments
    - Poll comments
    - Q&A comments / AMA
    - Reviews page
    - Feedback page

-->

<div class="Comments {classes}">
  {#if showHeader}
    <h2 class="Comments-header pb-2">{header}</h2>
  {/if}
  <div class="Comments-add mb-8">
    <AddComments {parentComment} commentLabel={false}></AddComments>
  </div>
  <ShowComments ></ShowComments>
</div>


<script>
	import { getContext } from 'svelte';

  import AddComments from '$instill-helpers/components/AddComments.svelte';
  import ShowComments from '$instill-helpers/components/ShowComments.svelte';

  export let classes = ''
  export let showHeader = true
  export let header = "Comments"

  let _context = getContext('space')
  let {_comments, _allComments, _space, _topic} = _context
  
  export let parentComment = _topic
  // export let comments
  // export let space = _space
  
  // $: {
  //   comments = $_allComments
  // }

</script>