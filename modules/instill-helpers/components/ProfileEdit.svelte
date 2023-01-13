
{#if !isLoggedIn}
<!-- {#if false} -->
  <form class="Check-password my-8 | Card-light " method="POST" action="{passwordCheckRoute}"
  use:enhance={({ form, data, cancel }) => {
    error = null
    message = 'Logging in...'

    if (profile.Slug !== slug) {
      error = 'Username does not match'
      message = null
      isLoggedIn = false
      return
    }
    return async ({ result, update }) => {
      if (result.status === 200 && result.data.success) {
        console.log('verification:', result.data)
        isLoggedIn = true
        error = null
        message = null
        $user.Password = null // not clearing this could lead to lots of screw ups
        update()
      } else {
        message = null
        error = result.data.error
      }
    }
  }}
  >
    <div class="mb-2 text-lg">
      Log in to edit profile
    </div>
    <!-- <div class="mb-4">A confirmation will be sent to your new email address</div> -->
    <label class="block mt-6">
      Username or Email
      <input name='Username' bind:value={slug} autocomplete="username" type="text" class="form-input mt-1 block w-full" placeholder="{slug}">
    </label>
    <label class="block mt-6">
      <span class="text-gray-700">Password</span>
      <input name='Password' bind:value={password} autocomplete="current-password" type="password" class="form-input mt-1 block w-full" placeholder="••••" required>
    </label>
    <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Log in">

  </form>
{:else}

  <div class="ProfileEdit-Menu | flex gap-4 mb-4">
    <div class="Card-light flex-1 ">
      <button class="Btn-link {pageMode=='edit'?'font-bold':''}" on:click={()=>{pageMode='edit'}}>Edit Profile</button>
      <button class="Btn-link {pageMode=='preview'?'font-bold':''}" on:click={()=>{pageMode='preview'}} >Preview Profile</button>
    </div>
    <div class="Card-light items-end">
      <a class="Btn-link" rel="noreferrer" href="{profileLink}" target="_blank">Open Preview</a>
    </div>
  </div>
  <form class="Card-light" method="POST" action="{updateProfileRoute}"
  use:enhance={({ form, data, cancel }) => {
    console.log('update profile::', form, data)
    error = null
    message = 'Saving profile...'

    return async ({ result, update }) => {
      if (result.status === 200 && result.data.success) {
        console.log('update profile results:', result.data)
        error = null
        message = `Profile saved! View your profile <a target="_blank" href="${profileLink}">here</a>.`
        // update() // don't refresh the page with update
        // await action()
      } else {
        message = null
        error = result.data.error
      }
    }
  }}>
    {#if pageMode == 'edit'}
      <div class="mb-2 text-lg">
        Edit Profile
      </div>
      <div class="my-4">
        <div class="grid grid-cols-1 gap-6">
          <label class="block">
            <span class="text-gray-700">Username</span>
            <span class="block text-sm py-1">
              Use your Username to sign in and post comments.
              <br><br>
              Your username is "{$user["Slug:Auto"]}", but you can change it below. Changing your username will change the link to your profile.</span>
            <input name='Username' bind:value={$user.Username} type="text" class="form-input mt-1 block w-full" placeholder="john-smith">

            <!-- old password entered in prev step; for validation -->
            <input name='verifyPassword' value={password} class="hidden" >

          </label>
          <label class="block">
            <span class="text-gray-700">Full name</span>
            <input name='Name' bind:value={$user.Name} type="text" class="form-input mt-1 block w-full" placeholder="John Smith">
          </label>
          <label class="block">
            <span class="text-gray-700">Short bio</span>
            <!-- <input name='Short' bind:value={$user.Short} type="text" class="form-input mt-1 block w-full" placeholder="Tweet-length description about yourself" maxlength="280"> -->
            <textarea name='Short' bind:this={short} on:keyup={(e)=>{
              // console.log('[Profile] Profile changed successfully!')
                e.target.style.height = "auto"
                e.target.style.height = (e.target.scrollHeight + 20) + "px"
              }} 
              bind:value={$user.Short} 
              class="form-textarea mt-1 block w-full h-32" 
              style="overflow: hidden;"
              placeholder="Short description about yourself"
              maxlength="280"
              ></textarea>
          </label>
          <label class="block">
            <span class="text-gray-700">Notion block ID</span>
            <span class="block my-2 text-sm | text-gray-700">Connect a public Notion page to your bio. Share your Notion page to web, and copy the web link, and add it here. Your Notion page will appear in your profile.</span>
            <input name='NotionBlockId' bind:value={$user.NotionBlockId} type="text" class="form-input mt-1 block w-full" placeholder="3982a26c26d643b2867302d323109376">
          </label>
          <label class="block">
            <span class="text-gray-700">Full bio</span>
            <textarea name='Description' bind:this={about} on:keyup={(e)=>{
              // console.log('[Profile] Profile changed successfully!')
                e.target.style.height = "auto"
                e.target.style.height = (e.target.scrollHeight + 20) + "px"
              }} 
              bind:value={$user.Description} 
              class="form-textarea mt-1 block w-full h-24" 
              rows="3" 
              style="overflow: hidden;"
              placeholder="A little something about yourself."></textarea>
          </label>

          <div class="block">
            <div class="flex | gap-2 place-items-center ">
              <ProfileAvatar user={$user} imgSrc={avatar} />
              <!-- {#if avatar}
                <img class="Avatar" src={avatar} alt="avatar"/>
              {:else}
                <span class="Avatar --placeholder" src={avatar} alt="avatar">{getInitials($user.Name)}</span>
              {/if} -->
              <div class="align-center">
                <CropUpload 
                  uploadLabel="Profile image"
                  on:uploaded={async e => {
                    // console.log('cropped + uploaded', e.detail)
                    $user['ProfileImage'] = e.detail.url
                    }}>
                </CropUpload>
                <input name='ProfileImage' value={$user['ProfileImage']} class="hidden" >
              </div>
            </div>
          </div>
          
          <div class="block">
            <div class="mt-8">
              <div class="">
                <!-- <Upload mode='simple' showPreview={false} ctaCardClasses='' classes="mt-6" uploadLabel="Cover image" on:uploaded={e => { 
                  console.log('uploaded', e.detail)
                  $user['CoverImage'] = e.detail.url
                  }} /> -->
                <CropUpload 
                  height={200} width={500} aspect={1.4}
                  uploadLabel="Cover photo"
                  on:uploaded={async e => {
                    // console.log('cropped + uploaded', e.detail)
                    $user['CoverImage'] = e.detail.url
                    }}>

                  {#if cover}
                    <img class="Cover w-full grow object-cover max-h-36 mb-2" src={cover} alt="cover"/>
                  {/if}
                </CropUpload>
                <input name='CoverImage' value={$user['CoverImage']} class="hidden" >
              </div>
            </div>
          </div>
          
          <label class="block">
            <span class="text-gray-700">Email address</span>
            <input name='Email' bind:value={$user.Email} type="text" class="form-input mt-1 block w-full" placeholder="hello@gmail.com">
          </label>

          <label class="block">
            <span class="text-gray-700">Enter a new password</span>
            <!-- user's password won't ever be sent to client, so this will always start out as empty -->
            <!-- <span class="block text-sm py-1">Passwords are encrypted</span> -->
            <input name='Password' bind:value={$user.Password} type="password" class="form-input mt-1 block w-full" placeholder="enter new password">
          </label>

        </div>

      </div>
    {:else if pageMode == 'preview'}
      <div class="">
        <ProfileView {baseConfig} outsideClasses={'_content-narrow'} profile={$user} slug={$user.Slug} />
      </div>
    {/if}

    <div class="| mt-2">
      <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Save Profile Details">
    </div>
  </form>

{/if}


{#if message}
  <div class="Card-primary | mt-4 ">
    {@html message}
  </div>
{/if}{#if error}
  <div class="Card-error | mt-4 ">
    {error}
  </div>
{/if}






<script>
  
	import { getContext } from 'svelte';
	import { enhance } from '$app/forms';
  import { writable } from 'svelte/store'
  import { commentUser } from '$instill/instill-store';
  import CropUpload from '$plasmid/components/CropUpload.svelte'
  import ProfileView from '$instill-helpers/components/ProfileView.svelte';
  import ProfileAvatar from '$instill-helpers/components/ProfileAvatar.svelte';

  let { baseConfig } = getContext( 'config')

  export let isLoggedIn = false
  export let slug = $commentUser?.Username || 'example-username'
  export let password = $commentUser?.Password // convenience for validation; should be updated in future
  export let pageMode = 'edit' // preview

  let baseUrl = `${baseConfig?.base_url}`
  export let passwordCheckRoute = baseConfig.settings.passwordCheckRoute || `${baseUrl}/profiles?/passwordCheck`
  export let updateProfileRoute = baseConfig.settings.updateProfileRoute || `${baseUrl}/profiles?/updateProfile`
  
  export let profile
  export let user = writable(profile)
  export let profileLink = `${baseUrl}/profiles/${$user.Slug}`

  let error, message
  let avatar, cover
  let croppedImage, croppedBlob
  // let newEmail = $user?.email, emailPassword = '', emailMessage, emailError
  // let passMessage, passError // for changing password
  let about, short // textarea bindings
  
  $: if(!$user.Username) {
    $user.Username = $user.Slug
  }

  $: {
    // avatar = getAvatar($user?.['ProfileImage:URL'])
    avatar = $user?.['ProfileImage:URL']
    cover = $user?.['CoverImage:URL']
  }
  $: if($user['ProfileImage'] && typeof $user['ProfileImage'] == 'string') {
    avatar = $user?.['ProfileImage']
  }
  $: if($user['CoverImage'] && typeof $user['CoverImage'] == 'string') {
    cover = $user?.['CoverImage']
  }












  $: if(about) {
    about.style.height = "auto"
    about.style.height = (about.scrollHeight + 20) + "px"
  }
  $: if(short) {
    short.style.height = "auto"
    short.style.height = (short.scrollHeight + 20) + "px"
  }

  $: if(croppedImage) {
    avatar = croppedImage
  }


  function getInitials(name) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,3)
  }


</script>




<style lang="scss">

</style>