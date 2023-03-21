

<!-- <form class="content" action="/api/form" method="post"> -->
{#if $user}
  <form class="Card-light" on:submit|preventDefault={handleEditProfile}>
    <div class="mb-2 text-lg">
      Edit Profile
    </div>
    <div class="my-4">
      <div class="grid grid-cols-1 gap-6">
        <label class="block">
          <span class="text-gray-700">Username</span>
          <input bind:value={$user.profile.username} type="text" class="form-input mt-1 block w-full" placeholder="jonsmith">
        </label>
        <label class="block">
          <span class="text-gray-700">Full name</span>
          <input bind:value={$user.profile.name} type="text" class="form-input mt-1 block w-full" placeholder="John Smith">
        </label>
        <label class="block">
          <span class="text-gray-700">About</span>
          <textarea bind:this={about} on:keyup={(e)=>{
            // console.log('[Profile] Profile changed successfully!')
              e.target.style.height = "auto"
              e.target.style.height = (e.target.scrollHeight + 20) + "px"
            }} 
            bind:value={$user.profile.about} 
            class="form-textarea mt-1 block w-full h-24" 
            rows="3" 
            style="overflow: hidden;"
            placeholder="A little something about yourself."></textarea>
        </label>
        <div class="block">
          <div class="flex | gap-2 place-items-center ">
            {#if avatar}
              <img class="Avatar" src={avatar} alt="avatar"/>
            {:else}
              <span class="Avatar --placeholder" src={avatar} alt="avatar">{getInitials($user.profile.name)}</span>
            {/if}
            <div class="align-center">
              <Cropper bind:croppedImage={croppedImage} bind:croppedBlob={croppedBlob}>
                <div class="text-gray-700 mb-2">Change avatar</div>
              </Cropper>
            </div>
          </div>
        </div>
        
      </div>
      <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Save Profile Details">
      

      {#if message}
        <div class="Card-success | mt-4 ">
          {message}
        </div>
      {/if}{#if error}
        <div class="Card-error | mt-4 ">
          {error}
        </div>
      {/if}


    </div>

  </form>

  <form class="Email-reset my-8 | Card-light " on:submit|preventDefault={()=>{handleEmailReset()}}>
    <div class="mb-2 text-lg">
      Change email
    </div>
    <div class="mb-4">A confirmation will be sent to your new email address</div>
    <label class="block mt-6">
      <span class="text-gray-700">Re-enter your Password</span>
      <input bind:value={emailPassword} type="password" class="form-input mt-1 block w-full" placeholder="••••" required>
    </label>
    <label class="block mt-6">
      Enter New email address
      <input bind:value={newEmail} type="email" class="form-input mt-1 block w-full" placeholder="john@example.com">
    </label>
    <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Change Email">

    {#if emailMessage}
      <div class="Card-success | mt-4 ">
        {emailMessage}
      </div>
    {/if}{#if emailError}
      <div class="Card-error | mt-4 ">
        {emailError}
      </div>
    {/if}

  </form>





  <form class="Password-reset my-8 | Card-light " on:submit|preventDefault={()=>{handlePasswordReset()}}>
    <div class="mb-2 text-lg">
      Change password
    </div>
    <div>A password reset email will be sent to your email</div>
    <!-- <label class="block mt-6">
      <span class="text-gray-700">Re-enter your Password</span>
      <input bind:value={passPassword} type="password" class="form-input mt-1 block w-full" placeholder="••••" required>
    </label> -->
    <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Change Password">
    
    {#if passMessage}
      <div class="Card-success | mt-4 ">
        {passMessage}
      </div>
    {/if}{#if passError}
      <div class="Card-error | mt-4 ">
        {passError}
      </div>
    {/if}
  </form>

  <div class="mt-4">
    <button class="Btn-outline" type="button" on:click={handleLogout}>Logout</button>
  </div>


{/if}







<script>
	import { page } from '$app/stores';
  import { goto } from '$app/navigation';
	import { user } from '$lib/store'
  import { getAvatar, updateProfile, requestEmailChange, requestPasswordReset } from '$plasmid/modules/pocket/'
  import Cropper from '$plasmid/modules/cropper/Cropper.svelte'

  
  let error, message, avatar
  let croppedImage, croppedBlob
  let newEmail = $user?.email, emailPassword = '', emailMessage, emailError
  let passMessage, passError // for changing password

  let about 
  
  $: {
    avatar = getAvatar($user?.profile)
  }

  $: if(about) {
    about.style.height = "auto"
    about.style.height = (about.scrollHeight + 20) + "px"
  }

  $: if(croppedImage) {
    avatar = croppedImage
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,3)
  }

  async function handleEmailReset() {
    try {
      emailError = null
      emailMessage = 'Sending confirmation email ...'
      await requestEmailChange(newEmail, $user.email, emailPassword)
      emailMessage = 'Confirmation email sent!'
    } catch (e) {
      let res = e.response
      if (res.data?.data?.newEmail?.message) {
        emailError = res.data?.data?.newEmail?.message // email exists
        emailMessage = null
      } else if (res.data?.message) {
        emailError = res.data.message
        emailMessage = null
      } else {
        emailError = e.response
        emailMessage = null
      }
    }
    emailPassword = null
  }

  async function handlePasswordReset() {
    try {
      passError = null
      passMessage = 'Sending password reset email ...'
      await requestPasswordReset($user.email)
      passMessage = 'Password reset email sent!'
    } catch (e) {
      let res = e.response
      if (res.data?.message) {
        passError = res.data.message
        passMessage = null
      } else {
        passError = e.response
        passMessage = null
      }
    }
  }

	async function handleLogout() {
		// session.set({ user: null });
		// await prefetch('/account/handle-logout');
		await goto('/api/account/logout');
	}


  async function handleEditProfile() {
    try {

      message = error = ''
      message = 'Updating profile ...'

      // avatar is only updated client-side, then url retrieved server-side
      // (overcomes vercel upload limitations)
      // this will trigger two server-side calls
      if(croppedImage) {
        await updateProfile($user, $user.profile, croppedBlob)
      }
      

			let res = await fetch('/api/account/update', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
          user: $user,
          profile: $user.profile
        })
			});

			if (res.ok) {
        // log-in as client as well
        let newUser = await res.json()
        $user = newUser
        // $session = newUser

        message = 'Profile updated successfully'
			} else {
        let err = await res.json()
        console.log('error:', err)
        if(err.code == 404)
          error = "Changes not saved. Please log back in"
      }

    } catch (e) {
      console.error('[handleEditProfile] error:', e, e.response)
      let res = e.response
      if (res.data?.data) {
        error = Object.values(res.data.data)[0].message
      } else {
        error = e.response
      }
    }
    
  }

</script>




<style lang="scss">

</style>