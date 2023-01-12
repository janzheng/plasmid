<!-- 

  List for all posts

  Behaviors
  - Click title open the full post body, with comments
  - Rendering of the post depends on its PostType
  - Generic post type defaults to HN-style behavior

  - Post List
    - URL, Title, Ask, Show, with # of comments listed.

  - Article List
    - Blog, Substack or Medium list of articles
    - Optional images


  Notes
  - Click into an Article to read content and comments
  
-->

<!-- <AddComments></AddComments> -->
<!-- <ShowComments></ShowComments> -->
<!-- <ShowArticles></ShowArticles> -->


<div class="PostList mb-16">
  {#if loud}
    <div class="Card-light p-2">
      PostList
      <br>Subpaths: {subpaths.join(', ')} {JSON.stringify(subpaths)}
      <br>Display post at subpath: [{subpaths[0]}]
      <br>Topic:<pre>{JSON.stringify(_topic,0,2)}</pre>
    </div>
  {/if}

  <!-- PAGES -->
  <!-- handle subpaths, like /article/ , /new/ -->
  {#if subpaths?.length > 0}
    {#if subpaths?.[0] == 'new'}
      <!-- NEW THREAD -->
      <div class="my-8">
        <a href="{baseUrl}/spaces/{_space?.name}">Back to {_space?.spaceName || _space?.name}</a>
      </div>
      <h2>Create a New Post</h2>  
      <AddComments isTopic={true} gotoTopic={true} ></AddComments>
    {:else if subpaths?.[1] == 'edit'}
      <!-- EDIT POST -->
      <h2>Edit Post</h2>  
      <!-- http://localhost:3051/instill/spaces/postlist/postid-123/edit -->
      <AddComments isTopic={true} gotoTopic={true} initComment={comments?.find(c=>c['Slug'] == subpaths?.[0])}></AddComments>
    {:else if !_topic?.Topic}
      <div class="my-4">
        Just empty space. <a href="{baseUrl}/spaces/{_space?.name}">Head back.</a>
      </div>
    {:else}
      <div>
        <div class="PostList-nav | Card-solid --light px-2 py-1 text-sm">
          <a href="{baseUrl}/spaces/{_space?.name}" class="">{_space?.spaceName || _space?.name}
          </a> / {_topic?.Topic}
        </div>
        <svelte:component this={pageType[_topic?.PostType] || pageType['Post']}/>
      </div>
    {/if}




  <!-- handle the list of posts -->
  <!-- PREVIEW LIST / STUBS -->
  {:else}
    <div class="PostList-header | my-4">
      <a href="{baseUrl}/spaces/{_space?.name}/new" class="btn btn-primary">{topicCta}</a>
      {#if showPostTypeFilters && postTypes}
        <span class="PostList-filters | ml-4">
          Filter by: 
          {#each postTypes as postType}
            <button class="Btn-link mr-2 {filter==postType?' font-bold line-through ':''}" on:click={()=>{filter=filter==postType?null:postType}}>{postType}</button>
          {/each}
        </span>
      {/if}
    </div>
    {#if topics?.length > 0}
      {#each topics as topic}
        {@const __comments = $_allComments.filter(cm => cm?.RootId?.includes(topic.TopicId))}
        <!-- PostStub, AskStub, etc. -->
        <svelte:component showSpace={false} {topic} comments={__comments} this={stubType[topic.PostType] || stubType['Post']}/>
      {/each}
    {:else}
      {#if showPostTypeFilters && postTypes && filter}
        <div class="PostList-empty | Card-light p-2">
          No posts found for "{filter}".
        </div>
      {:else}
        <div class="PostList-empty | Card-light p-2">
          No posts yet.
          <a href="{baseUrl}/spaces/{_space?.name}/new" class="">Be the first to post!</a>
        </div>
      {/if}
    {/if}
  {/if}


</div>

<!-- pre-load tw -->
<span class="font-bold underline line-through"></span>





<script>

	import { setContext } from 'svelte';
	import { page } from '$app/stores';
  import AddComments from '$instill-helpers/components/AddComments.svelte';

  // STUBS for the List
  // import ArticleStub from '$instill-helpers/components/blocks/ArticleStub.svelte';
  import PostStub from '$instill-helpers/components/blocks/PostStub.svelte';
  import AskStub from '$instill-helpers/components/blocks/AskStub.svelte';
  import PollStub from '$instill-helpers/components/blocks/PollStub.svelte';

  // PAGES 
  import ArticlePage from '$instill-helpers/components/blocks/ArticlePage.svelte';
  import PostPage from '$instill-helpers/components/blocks/PostPage.svelte';
  import AskPage from '$instill-helpers/components/blocks/AskPage.svelte';
  import CommentList from '$instill-helpers/components/blocks/CommentList.svelte';

  export let {spaceName, subpaths, comments} = getContext( 'spaceData' )

	import { getContext } from 'svelte';
  let _context = getContext('space')
  let { baseConfig } = _context
  let baseUrl = baseConfig.base_url || '';

  let {_comments, _allComments, _space, _topic} = _context || {}
  let loud = _space?.settings?.loud || false

  // console.log('urllll:', $page.url, _space)
  // $: console.log('[[PostList space/context]]', _space, _context, $_comments, $_allComments)

  export let type = 'PostList'
  export let sort = _space?.settings?.[type]?.sort || 'latest'
  export let filter = _space?.settings?.[type]?.filter || null 
  export let topicCta = _space?.settings?.topicCta || `New Post`
  export let showPostTypeFilters = _space?.settings?.showPostTypeFilters || true
  export let postTypes = _space?.settings?.postTypes || []
  // 
  // STUBS: Displays for the Post List
  // e.g. Feed, List
  // 
  export let stubType = {
    // Article: ArticleStub, // dynamic list for all posts articles, polls, posts
    Article: PostStub, // dynamic list for all posts articles, polls, posts
    Ask: AskStub, // dynamic list for all posts articles, polls, posts
    Poll: PollStub, // dynamic list for all posts articles, polls, posts
    Post: PostStub, // generic post
    CommentList: PostStub, // list of comments, without a topic / thread / post above it
  }

  // 
  // PAGES: Full Post pages w/ Routing
  // - e.g. blog
  // 
  export let pageType = {
    Article: ArticlePage, // dynamic list for all posts articles, polls, posts
    CommentList: CommentList, // list of comments, without a topic / thread / post above it
    Post: PostPage, // generic post
    Link: PostPage,
    Suggestion: PostPage,
    Ask: AskPage,
  }

  let topics = $_comments
  if($_comments) {
    topics = $_comments
    topics = topics?.filter(cm => cm.Topic && cm.PostType != 'Root')  // only show thread starters
  }
  
  $: {
    if(filter) {
      topics = $_comments
      topics = topics?.filter(cm => cm.Topic && cm.PostType != 'Root')  // only show thread starters
      topics = topics?.filter(cm => cm.Topic && cm.PostType == filter)  // only show thread starters
    } else {
      topics = $_comments
      topics = topics?.filter(cm => cm.Topic && cm.PostType != 'Root')  // only show thread starters
    }
    if (sort == 'latest') {
      topics = topics?.sort((a,b) => new Date(b.Created) - new Date(a.Created))
      topics = topics?.sort((a,b) => b.PostStatuses?.includes('Pinned') ? 1 : -1)
    }

  }

</script>