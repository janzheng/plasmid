
{#if !isCreated}
  <div class="Register my-8 | Card-light ">

    <div class="mb-2 text-lg">
      Create Account
    </div>

    {#if !doContinue}
      <form class="Email-check " method="POST" action="{emailCheckRoute}"
        use:enhance={({ form, data, cancel }) => {
          error = null
          message = "Verifying email ..."

          return async ({ result, update }) => {
            if (result.data?.found === false) {
              doContinue = true
            message = null
            } else {
              message = "Email already exists"
            }
          }
        }}
      >
        <!-- <div class="mb-4">A confirmation will be sent to your new email address</div> -->
        <label for='Email' class="block mt-6">
          Email
          <input name='Email' bind:value={email} autocomplete="email" type="email" class="form-input mt-1 block w-full" placeholder="john@example.com" required>
        </label>
        <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Continue">
      </form>
    {:else}
      <form class="" method="POST" action="{registerRoute}"
        use:enhance={({ form, data, cancel }) => {

        console.log('Creating::', form, data)
        error = null
        message = 'Creating account...'

        return async ({ result, update }) => {
          if (result.status === 200 && result.data.success) {
            message = 'Account created! Redirecting...'
            console.log('Profile created -->', result.data)
            $profile = result.data.profile
            isCreated = true
            updateEditSlug(result.data.profile.Slug)
            updateUser(result.data.profile.Slug)
          } else {
            message = null
            error = result.data.error
          }
        }
      }}
      >
        <!-- <div class="mb-4">A confirmation will be sent to your new email address</div> -->
        <label for='Email' class="block mt-6">
          Email
          <input name='Email' bind:value={email} autocomplete="email" type="email" class="form-input mt-1 block w-full" placeholder="john@example.com" readonly>
        </label>
        <label class="block mt-6">
          First and Last Name
          <input name='Name' autocomplete="name" type="text" class="form-input mt-1 block w-full" placeholder="John Doe" required>
        </label>
        <label class="block mt-6">
          <span class="text-gray-700">Create your password</span>
          <input name='Password' bind:value={password} autocomplete="new-password" type="password" class="form-input mt-1 block w-full" placeholder="••••" required>
        </label>
        <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Create account">

      </form>
    {/if}

    {#if message}
      <div class="Card-primary | mt-4 ">
        {message}
      </div>
    {/if}{#if error}
      <div class="Card-error | mt-4 ">
        {error}
      </div>
    {/if}

  </div> 
{:else}
  <ProfileEdit profile={$profile} {password} isLoggedIn={true} />
{/if}











<script>
  import { commentUser } from '$instill/instill-store';
	import { setContext } from 'svelte';
	import { enhance } from '$app/forms';
  import { writable } from 'svelte/store'
	import { page } from '$app/stores';
  // import { goto, prefetch } from '$app/navigation';
  import ProfileEdit from '$instill-helpers/components/ProfileEdit.svelte'

  export let profile = writable({}), doContinue, isCreated
  export let baseConfig

  setContext( 'config', {baseConfig})

  let email, password
  let error, message

  // let _context = getContext('space')
  let baseUrl = `${baseConfig?.base_url}`

  console.log('register: ', baseConfig, baseConfig.base_url.length, baseConfig.base_url, '???', baseUrl)

  // FUTURE
  // these should be related to baseConfig, not space, probably
  // export let emailCheckRoute = _context?._space?.settings?.emailCheckRoute || `${baseUrl}/join?/emailCheck`;
  // export let registerRoute = _context?._space?.settings?.registerRoute || `${baseUrl}/join?/join`;
  export let emailCheckRoute = `${baseUrl}/join?/emailCheck`;
  export let registerRoute = `${baseUrl}/join?/join`;

  function updateEditSlug(slug) {
    if (typeof window !== 'undefined') {
      history.replaceState({}, '', `${baseConfig.base_url}/profiles/${slug}/edit`)
    }
  }

  function updateUser(slug) {
    commentUser.update((n) => {
      n.Username = slug
      n.Password = password
      return n
    })
  }
</script>




<style lang="scss">

</style>