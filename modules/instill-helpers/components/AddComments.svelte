
<!-- Parent: {parentComment?.Name} -->
<!-- body: <pre>{JSON.stringify(comment,0,2)}</pre> -->

{#if isMounted}

  <form method="POST" action="{actionRoute}"
    use:enhance={async ({ form, data, action, cancel }) => {

    // console.log('posting data,', data)

    // uploading image to R2 if it exists
    let imgUpload = await uploadFile();
    if(imgUpload) {
      // this will trigger uploaded! event BUT it won't make it into this form data
      // so we have to manually replace it here
      $comment.ImageUrl = imgUpload.url;
      data.set('ImageUrl', imgUpload.url);
      console.log('----> new image:', data.get('ImageUrl'))
    }


    isPosting = true
    
    // optimistic updating for comments
    if(useOptimistic) {
      let { Username, Parent, Comment } = Object.fromEntries(data)
      let parentComment
      if(Parent) {
        parentComment = $_allComments.find(c=>c.Name == Parent)
      }
      console.log('Saving...', Object.fromEntries(data), 'parent:', parentComment)
      $_tempComments = [{
        Username, Comment,
        Parent: parentComment ? [parentComment.id] : null,
        Created: new Date(),
      }]; // $_tempComments=$_tempComments // use this if pushing new comments to array
    }
    

    // if(parentComment) {
    //   data.PostType = 'Reply!' // always set replies as a special reply type if there's a parent comment
    // }

    openReply = false; // close parent comment box

    return async ({ result, update }) => {

      // `result` is an `ActionResult` object
      // console.log('Form result!', result)
      unique = [{}] // reset Turnstile
      error = ""

      if(result?.data?.success) {
        
        $commentUser['Comment'] = null
        $commentUser['Topic'] = null
        $commentUser['_postSuccessful'] = true
        hideLogin = true // auto hide after each success

        dispatch('success', result?.data?.comment)

        // re-run all `load` functions, following the successful update
        // invalidate first — then reset optimistic comments to preven jarring jump
        await invalidateAll(); // reload all data
        $_tempComments = [] // reset optimistic comments
        isPosting = false

        console.log('Comment added successfully! Resetting comment:', result?.data?.comment, $comment, $commentUser)
        // scrollToAnchor(`#${result.data.comment.id}`)

        // re-add all details into the comment after revalidation, so form isn't empty
        $comment = {
          ...$commentUser,
          ...$comment,
        }
        $comment['Comment'] = null
        $comment['Topic'] = null
        $comment['_postSuccessful'] = true

        let slug = result?.data?.comment?.['Slug']
        
        if(successCallbackFn) {
          successCallbackFn(result?.data?.comment)
        }

        if(gotoTopic && slug) {
          goto(`${baseUrl}/spaces/${_space?.name}/${slug}`)
          // goto(slug) // doesn't work on edit mode
        } else {
          update() // `update` is a function which triggers the logic that would be triggered if this callback wasn't set
        }

      } else {
        isPosting = false
        console.log('[AddComments] Form result error:', error, result)
        error = result?.data?.error
      }
    };
  }}>

    {#if commentDescription}
      <div class="AddComments-description | mb-4">
        {commentDescription}
      </div>
    {/if}

    <!-- hidden data for form action -->
    <div class="hidden">
      <input name="Space" bind:value={$comment.Space} type="text">
      <input name="Parent" bind:value={$comment.Parent} type="text">
      <input name="Root" bind:value={$comment.Root} type="text">
      <input name="RecordId" bind:value={$comment.RecordId} type="text">
      <input name="PostStatuses" bind:value={$comment.PostStatuses} type="text">
      <input name="ImageUrl" value={$comment.ImageUrl} type="text">
      <input name="Json" value={$comment.Json && Object.values($comment.Json).length>0 && JSON.stringify($comment.Json)} type="text">
      <!-- todo: post type selection / alternate interface -->
      <input name="PostType" bind:value={$comment.PostType} type="text">
    </div>

    <!-- <input bind:value={comment.email} type="text" class="form-input mt-1 block w-full" placeholder="yawnxyz"> -->
    {#if isTopic}
      {#if postTypes && postTypes.length > 0}
        <div class="AddComments-postTypes | my-6">
          <span class="mr-1">Select post type: </span>
          {#each postTypes as type}
            <label class="AddCommentspostTypes-type | inline-flex items-center mr-2">
              <div class="Btn-outline --thin --tight text-left">
                <input type="radio" class="form-radio peer mb-[0.2rem]" name="PostType" value={type} on:change={()=>{updatePostType(type)}} bind:group={$comment.PostType} required>
                <span class="">{type}</span>
              </div>
            </label>
          {/each}
        </div>
      {/if}
      
      <div class="AddComments-topic-container | my-4">
        {#if isTopic && topicLabel}<label class="AddComments-topic-label inline-block" for="Topic">{topicLabel}</label>{/if}
        <input id="Topic" name="Topic" bind:value={$comment.Topic} type="text" class="AddComments-topic-input form-input mt-1 block w-full" placeholder="{topicPlaceholder}" required={true}>
      </div>
      
      {#if addLink || (topicAddLink && isTopic)}
        <div class="AddComments-link-container | my-4">
          <label class="AddComments-link-label inline-block" for="Url">{topicAddLinkLabel}</label>
          <input id="{'Url'}" name="{'Url'}" bind:value={$comment.Url} type="text" class="AddComments-link | mt-1 block w-full" placeholder="{topicAddLinkPlaceholder}" required={addLinkRequired}>
        </div>
      {/if}
      
      <!-- dynamic topicFields -->
      {#if isTopic && $comment.PostType && topicFields }
        <div class="AddComments-dynamic-container | my-4">
          {#each topicFields as field}
            {#if field.label}<label for="{field.name}" class="AddComments-dynamic-label | inline-block">{field.label}</label>{/if}
            <!-- hiding this ends up not showing anything for new topics -->
            <!-- {#if comment.Json?.[field.name]} -->
            {#if field.type === 'textarea'}
              <!-- textarea here -->
              <textarea rows={field.rows} name="{field.name}" bind:value={$comment.Json[field.name]} class="AddComments-dynamic-textarea | mt-1 block w-full" placeholder="{field.placeholder}"></textarea>
            {:else}
              <input id="{field.name}" name="{field.name}" bind:value={$comment.Json[field.name]} type="text" class="AddComments-dynamic-input | mt-1 block w-full" placeholder="{field.placeholder}">
            {/if}
            <!-- {/if} -->
          {/each}
        </div>
      {/if}
    {/if}

    
    <!-- default Comments entry block -->
    <div class="AddComments-comments-container">
      <!-- comment label only changes for different topics! -->
      <!-- {#if isTopic &&(comment.PostType) && topicFields && topicFields[comment.PostType]} -->
        {#if commentLabel}<label class="AddComments-comments-label inline-block" for="Comment">{commentLabel}</label>{/if}
      <!-- {/if} -->
      {#if commentType == 'text'}
        <input id="Comment" name="Comment" bind:value={$comment.Comment} type="text" 
          required={commentRequired} 
          class="AddComments-comments-input | mt-1 block w-full" 
          placeholder="{commentPlaceholder}">
      {:else}
        <TextAreaAuto 
          id={"Comment"} name={"Comment"}
          classes={"AddComments-comments-textarea mt-1 block w-full"}
          placeholder="{commentPlaceholder}"
          bind:value={$comment.Comment}  
          minRows={commentRows}
          required={commentRequired}
        />
      {/if}
    </div>

    {#if uploadImage || (topicUploadImage && isTopic)}
      <div class="AddComments-upload-container">
        <Upload mode='simple' classes="mt-6" urlPreview={$comment.ImageUrl} 
          uploadLabel="{topicUploadImageCta}" 
          showUploadBtn={false} previewCardClasses='' showStatusMessage={false}
          bind:uploadFile={uploadFile}
          on:uploaded={e => { 
            console.log('uploaded!', e.detail)
            $comment.ImageUrl = e.detail.url || null
          }} />
      </div>
      <!-- image url: {$comment.ImageUrl} -->
    {/if}


    {#if topicKeywords}
      {#if topicKeywordsLabel}<label class="AddComments-keywords-label inline-block" for="Keywords">{topicKeywordsLabel}</label>
      {/if}
      <input id="Keywords" name="Keywords" bind:value={$comment.Keywords} type="text" class="AddComments-keywords-input | mt-1 block w-full" placeholder="{topicKeywordsPlaceholder}">
    {/if}

    <!-- login block - don't pass comment in here -->
    <SimpleLogin />

    <div class="AddComments-submit-container | my-4">
      <button class="AddComments-submit Btn-solid" disabled={!challengePassed||isPosting}>{ctaText}</button>
      {#if isPosting}
        <span class="ml-2">{savingText}</span>
      {/if}
    </div>

    {#if useTurnstile}
      <div class="AddComments-turnstile-container my-4">
        {#each unique as key (key)}
          <div class="hidden">
            <Turnstile on:turnstile-callback={()=>{challengePassed=true}} siteKey={env.PUBLIC_TURNSTILE_SITEKEY} theme="light" />
          </div>
        {/each}
      </div>
    {/if}
  </form>

  {#if form?.error || error}
    <p class="AddComments-error | Card-error mb-8">{form?.error || error}</p>
  {/if}
{:else}
  Loading ...
{/if}
















  
<script>

  import * as store from 'svelte/store'
	import { page } from '$app/stores';
	import { getContext, onMount, createEventDispatcher } from 'svelte';
  import { commentUser } from '$instill/instill-store'

  import { invalidateAll, goto } from '$app/navigation';
  import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
  import { Turnstile } from 'svelte-turnstile';
  import { env } from '$env/dynamic/public';

  import TextAreaAuto from "$plasmid/components/TextAreaAutosize.svelte";
  import Upload from '$plasmid/modules/r2upload/Upload.svelte' 
  import SimpleLogin from '$instill-helpers/components/SimpleLogin.svelte';
  // import { maskPassword } from "$plasmid/utils/auth/auth-helpers"
  // import { scrollToAnchor } from "$plasmid/utils/scrollto.js";
  // import { fetchPost } from "$plasmid/utils/fetch-helpers"

  
  let _context = getContext('space')
  let {baseConfig, _allComments, _tempComments, _space, _topic} = _context
  let hideLogin = false

  let baseUrl = baseConfig.base_url == '' ? "" : '/instill';
  export let actionRoute = _space.settings.actionRoute || `${baseUrl}/spaces`
  export let savingText = baseConfig?.settings?.savingText || 'Posting...'
  export let successCallbackFn = null; // triggered after successful form submission
  export let form=null;
  export let parentComment=null; // pass in parent ID for threaded comments
  export let openReply=false; // opens / closes replies
  export let isTopic=false; // allows for Topic / Thread starters
  export let defaultPostType = _space.settings?.defaultPostType || 'Post'; // Article, Post, Ask, etc.
  export let postTypes = _space.settings?.postTypes || null; // ['Article', 'Ask', 'Post'], etc.
  export let gotoTopic=false; // if true, will redirect to topic after posting 
  export let useOptimistic = _space.settings?.useOptimistic
  export let useTurnstile = baseConfig.settings.useTurnstile;


  export let postTypeSettings = {}
  export let uploadImage, topicUploadImage, topicUploadImageCta='Add an image' // upload image for topics; overrides uploadImage
  export let addLink, addLinkRequired, topicAddLink, topicAddLinkLabel, topicAddLinkPlaceholder
  export let topicKeywords, topicKeywordsLabel, topicKeywordsPlaceholder

  // export let topicUploadImages = _space.settings?.topicUploadImages // upload image for topics; overrides uploadImage
  export let ctaText = isTopic ? _space.settings?.topicCta || 'Post Topic' : _space.settings?.commentCta || 'Add Comment'
  export let topicFields = null // _space.settings?.topicFields // extra fields for topics to be jsonified
  export let topicLabel = 'Title'
  export let topicPlaceholder = 'Enter a title'
  export let commentLabel = 'Text'
  export let commentDescription = null
  export let commentPlaceholder = 'Enter some text'
  export let commentRequired = true
  export let commentRows = 4
  export let commentType = 'textarea'

  let error='', isPosting=false, isMounted=false
  // let files=[], fileUpload={}, fileStatus = store.writable({})

  // can turn turnstile off in comments
  let challengePassed = _space?.settings?.useTurnstile ? false : true
  // used to reset turnstile
  let unique = [{}] // every {} is unique, {} === {} evaluates to false

  // active comment to be submitted
  // commentUser is the localStorage saved user object
  export let initComment = {}
  export let comment = store.writable({ Json: {} })
  export let isEditing = initComment.RecordId || initComment.recordId

  export let uploadFile = ()=>{}; // bound to upload.svelte image upload

	onMount(async () => {
    // console.log('addcomm initComment -->', initComment)
    $comment = {
      ... $comment,
      Parent: initComment.Parent,
      Root: initComment.Root,
      // Parent: parentComment?.Name, // uses the Name auto number; future might need to switch to ID
    //   // Root: parentComment?.Name,
      Username: $commentUser.Username, // `jan-zheng`,
      Email: $commentUser.Email, 
      Password: $commentUser.Password,
      Comment: initComment.Comment || $commentUser.Comment || '',
      Topic: initComment.Topic || $commentUser.Topic || null,
      PostType: initComment.PostType || $commentUser.PostType || defaultPostType || 'Post',
      Keywords: initComment.Keywords || $commentUser.Keywords || '',
      Space: JSON.stringify(_space), // "spacejam"
      RecordId: initComment.RecordId || initComment.recordId || null, // for editing a post
      PostStatuses: initComment.PostStatuses, // for editing a post; a CSV
      ImageUrl: initComment.ImageUrl || null,
      Url: initComment.Url || $commentUser.Url || null,
      Json: initComment.Json || {},
      _postSuccessful: $commentUser._postSuccessful,
    }

    hideLogin = $commentUser._postSuccessful

    if(isEditing)
      ctaText = _space.settings?.editCta || "Save Edit"

    // a thread has a parent only if it's not a topic; if it's a topic it's a root
    if(parentComment?.id == _topic?.id) {
      $comment.Root = parentComment?.Name
    } else {
      $comment.Root = _topic?.id
      $comment.Parent = parentComment?.Name
    }

    updatePostType(initComment.PostType || $commentUser.PostType || defaultPostType || 'Post')
    isMounted = true
	})

  // $: console.log('addComment comment:::', $comment, 'isTopic?', isTopic, '$commentUser:', $commentUser, initComment.PostType, $commentUser.PostType, defaultPostType)
  // $: console.log('addComment comment:::', comment)

  // save the inputs for the future / refresh, unless editing
  // -> don't save when editing, bc we don't really need that data to persist
  $: if($comment && isMounted && !isEditing) {
    commentUser.update((n) => {
      return {
        ...n,
        // Username: $comment.Username,
        Email: $comment.Email,
        // Password: $comment.Password,
        Comment: $comment.Comment,
        Topic: $comment.Topic,
        Keywords: $comment.Keywords,
        Url: $comment.Url,
        // PostType: $comment.PostType,
        _postSuccessful: $comment._postSuccessful,
      }
    })
    // $commentUser = {
    //   Username: $comment?.Username,
    //   Email: $comment?.Email,
    //   Password: $comment?.Password,
    //   Comment: $comment?.Comment,
    //   Json: $comment?.Json,
    //   Topic: $comment?.Topic,
    //   // PostType: $comment?.PostType, // could lead to some weird bugs, e.g. context switching into other reply boxes
    //   _postSuccessful: $comment?._postSuccessful, // used to hide the login after first successful post; only set after a successful post
    //   // ^ is temporary, in lieu of a real login, but having this kind of no-login system is kind of nice too
    // }
  }

  // dynamic settings based on postType
  // $: if($comment.PostType) {
  // explain what this function does:
















  // for NEW POSTS
  // this is updated when we have a new post type set (e.g link or job)
  function updatePostType(postType = $comment.PostType) {

    // if $comment.Json[field.name] is equal to the default postTypeSettings?.topicFields fields value, remove it
    // this is so that the default value doesn't get saved to the database
    // however if it's been altered, we don't delete it, in case it's other metadata
    if($comment.Json && postTypeSettings?.topicFields) {
      for(let field of postTypeSettings?.topicFields) {
        let _val
        try { _val = JSON.parse($comment.Json[field.name]) } catch(e) { _val = $comment.Json[field.name] }
        // console.log('comp:', field.name, _val, $comment.Json[field.name], field.value, JSON.stringify(_val) === JSON.stringify(field.value))
        if(JSON.stringify(_val) === JSON.stringify(field.value)) {
          delete $comment.Json[field.name]
        }
      }
    }

    postTypeSettings = _space.settings?.postTypeSettings?.[postType] || _space.settings?.postTypeSettings ||  {}
    
    // console.log('posttype settings:', _space.settings?.postTypeSettings?.[comment.PostType], postTypeSettings, '#$%#$%#$', defaultPostType, comment.PostType, initComment.PostType, $commentUser.PostType)
    
    topicFields = postTypeSettings?.topicFields // extra fields for topics to be jsonified

    ctaText = postTypeSettings?.postCta || ctaText
    topicPlaceholder = postTypeSettings?.topic?.placeholder || 'Enter a post title'
    topicLabel = postTypeSettings?.topic?.label || 'Post Title'
    // topicPlaceholder = _space.settings?.topicPlaceholders?.[comment?.PostType||postType] || 'Enter a title'

    commentLabel = postTypeSettings?.comment?.label || null // 'Text'
    commentPlaceholder = postTypeSettings?.comment?.placeholder || 'Enter some text for your post'
    commentRequired = postTypeSettings?.comment?.required ? postTypeSettings?.comment?.required : false
    commentRows = postTypeSettings?.comment?.rows || 4
    commentDescription = postTypeSettings?.description
    commentType = postTypeSettings?.comment?.type || 'textarea'

    topicUploadImage = postTypeSettings?.uploadImages || false
    topicUploadImageCta = postTypeSettings?.uploadImages?.label || 'Add an image'

    addLinkRequired = postTypeSettings?.addLink?.required || false
    topicAddLink = postTypeSettings?.addLink || false
    topicAddLinkLabel = postTypeSettings?.addLink?.label || 'Link'
    topicAddLinkPlaceholder = postTypeSettings?.addLink?.placeholder || 'Add a link'

    topicKeywords = postTypeSettings?.keywords
    topicKeywordsLabel = postTypeSettings?.keywords?.label
    topicKeywordsPlaceholder = postTypeSettings?.keywords?.placeholder || 'Enter keywords'


    for (const field of postTypeSettings?.topicFields || []) {
      if (typeof field.value == 'object') {
        $comment.Json[field.name] = $comment.Json[field.name] || JSON.stringify(field.value,0,2)
      } else {
        $comment.Json[field.name] = $comment.Json[field.name] || field.value
      }
    }

    // if replying to a comment
    if(parentComment) {
      postTypeSettings = _space.settings?.postTypeSettings?.[parentComment.PostType] || {}
      $comment.PostType = 'Reply' // always set replies as a special reply type — leads to some weird bugs; can't pull topic-specific Reply text if this is changed; moved to submit code
      // console.log('---> parent --->', parentComment.PostType, _space.settings?.postTypeSettings?.[parentComment.PostType])
      commentRequired = true
      ctaText = postTypeSettings?.replies?.postCta || 'Add a Comment'
      commentLabel = postTypeSettings?.replies?.label || 'Comment'
      commentPlaceholder = postTypeSettings?.replies?.placeholder || 'Enter some comment text'
      commentRows = postTypeSettings?.replies?.rows || 4
      commentDescription = null // 'Enter comment'
      topicUploadImage = false
      topicAddLink = false
    }
    if(isEditing) {
      // commentRequired = true
      ctaText = 'Edit Post'
      commentPlaceholder = 'Enter some text'
      commentRows = postTypeSettings?.replies?.rows || 4
      // commentDescription = null // 'Enter comment'
    }


    // console.log('[AddComments] postTypeSettings:', postType, $comment.PostType, postTypeSettings, topicFields, commentLabel, $comment, _space.settings)
  }

  const dispatch = createEventDispatcher();

 </script>





