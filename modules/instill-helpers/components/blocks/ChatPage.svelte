<!-- 

  Chat Page
  - Single-channel Real-time page, similar to CommentList 
  
  Future
  - Combine with Channel List / Post List for a multi-channel chat experience

-->

<div class="Comments {classes}">
  <!-- {#if showHeader}
    <h2 class="pb-2">{header}</h2>
  {/if} -->
  

  <div class="Comments-container | mb-64">
    <ShowComments ></ShowComments>
  </div>

  <!-- <div class="Comments-add | mt-4 mb-0 | sticky bottom-4 "> -->
  <div class="Comments-add-container | mt-4 mb-0 | z-50 fixed bottom-0 left-0 px-8 w-full h-fit bg-white/90">
    <div class="Comments-add | _content-narrow h-fit mx-auto">
      <AddComments {parentComment} commentLabel={false}></AddComments>
    </div>
  </div>
</div>


<script>
	import { getContext } from 'svelte';

  import AddComments from '$instill-helpers/components/AddComments.svelte';
  import ShowComments from '$instill-helpers/components/ShowComments.svelte';

  export let classes = ''
  // export let showHeader = true
  // export let header = "Comments"

  let _context = getContext('space')
  let {_comments, _allComments, _space, _topic} = _context
  
  export let parentComment = _topic
  // export let comments
  // export let space = _space
  
  // $: {
  //   comments = $_allComments
  // }

</script>