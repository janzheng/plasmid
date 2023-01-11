
<svelte:head>
  <title>{spaceName} {_space?.description ? ' | ' + _space?.description : '' }</title>
</svelte:head>



{#if loading}
  <p>loading {spaceName}...</p>
{:else if (_space && !_space.name) || !_space}
  <h1>No space found at "{spaceName}"</h1>
{:else}
  {#if _space?.spaceName || _space?.description}
    <div class="Space-header mb-2">
      <div class="Card-flat">
        {#if _space?.spaceName}<h2 class="Space-title pt-0">{_space?.spaceName}</h2>{/if}
        <div class="Space-description pfix">{@html marked(_space?.description || '')}</div>
      </div>
    </div>
  {/if}

  {#if loud}
    <div class="Card-light p-2">
      [Space] Page
      <!-- <br>Data path: {data?.path} -->
      <br>Data path: {subpaths}
    </div>
  {/if}

  <!-- <pre>{JSON.stringify(data,0,2)}</pre> -->
  <svelte:component this={blockType}/>
  
{/if}












<script>
  
  import { getDerivedComments } from '$instill/instill-store'

	import { setContext } from 'svelte';
  import { writable } from 'svelte/store'
  import { invalidateAll } from '$app/navigation';

  import { marked } from 'marked';
  import { poll } from "$plasmid/utils/poll.js";
  import { filterFind } from '$plasmid/utils/filterby'

  
  import ArticlePage from '$instill-helpers/components/blocks/ArticlePage.svelte'; // single article on w/ comments
  import CommentList from '$instill-helpers/components/blocks/CommentList.svelte'; // basic comment component
  import ChatPage from '$instill-helpers/components/blocks/ChatPage.svelte'; // basic comment component
  import PostList from '$instill-helpers/components/blocks/PostList.svelte'; // HN-clone: list of posts w/ comment count; click to read and comment


  export let blockTypes = {
    ArticlePage: ArticlePage,   // single page article with comments at bottom
    ChatPage: ChatPage,         // single page comments like a single-channel real-time chat Slack 
    PostList: PostList,         // dynamic list for all posts (articles, polls, posts), w/ routing for each post
    CommentList: CommentList,   // list of comments, without a topic / thread / post above it
  };

  export let baseConfig

  export let blockType;
  export let spaceName, subpaths, comments, profiles;
  export let loading = true;
  export let _space;
  let polling;
  let topic;
  let spaceObj;
  export let _comments;
  let loud = _space?.settings?.loud || false;


  let _commentStore = writable([]);
  let _tempCommentStore = writable([]);


  $: if(spaceName && subpaths) {
    blockType = blockTypes[_space?.settings?.blockType] // blockType = PostList

    loud = _space?.settings?.loud || false


    // filter the comments here before passed down
    if(subpaths && subpaths.length == 1) {
      topic = comments.find(cm => cm.Slug == subpaths[0])
      // console.log('space subpath filtering:', topic)
      // $comments = data?.comments.filter(cm => cm.TopicId == topic?.TopicId || cm.RootId == topic?.TopicId)
      _comments = comments.filter(cm => cm.TopicId == topic?.TopicId || cm.RootId == topic?.TopicId)
    } else {
      _comments = comments
    }

    // call invalidateAll() every 5 second // future: might move to a derived store
    polling = _space?.settings?.polling?.enabled ? poll(invalidateAll, _space?.settings?.polling?.speed) : null

    // build an object of stores for comments per space / path
    _commentStore.set(_comments) // THIS MIGHT NOT WORK - cause infinite loops or not update correctly across paths
    spaceObj = {
      _topic: topic,
      _space, // : new writable(_space),
      // _comments: new writable(_comments), 
      // _tempComments: new writable(_tempComments),
      _comments: _commentStore, 
      _tempComments: _tempCommentStore, 
      _allComments: getDerivedComments(_commentStore, _tempCommentStore),
      baseConfig,
    }

    // console.log('[SpaceView] Data:', spaceObj, {spaceName, subpaths, comments, profiles})

    setContext( 'spaceData', {spaceName, subpaths, comments, profiles})
    setContext( 'space', spaceObj)
    loading = false
  }
  
</script>






