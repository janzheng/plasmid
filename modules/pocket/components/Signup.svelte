


<!-- <form class="content" action="/api/form" method="post"> -->
<form class="Card-light" on:submit|preventDefault={handleSubmit}>
  <slot></slot>
  <div class="my-4">
    <div class="grid grid-cols-1 gap-6">
      <label class="block">
        <span class="text-gray-700">Full name</span>
        <input bind:value={profile.name} type="text" class="form-input mt-1 block w-full" placeholder="Jon Smith" required>
      </label>
      <label class="block">
        <span class="text-gray-700">Username</span>
        <input on:input={()=>{recUsername = false}} bind:value={profile.username} type="text" class="form-input mt-1 block w-full" placeholder="jonsmith" required>
      </label>
      <label class="block">
        <span class="text-gray-700">Email address</span>
        <input bind:value={user.email} type="email" class="form-input mt-1 block w-full" placeholder="john@example.com" required>
      </label>
      <label class="block">
        <div class="flex">
          <span class="text-gray-700">Password</span>
        </div>
        <input bind:value={user.password} type="password" class="form-input mt-1 block w-full" placeholder="•••••••••••••" required>
      </label>
      
      <!-- <label class="block">
        <div class="flex">
          <span class="text-gray-700">Confirm Password</span>
        </div>
        <input bind:value={user.passwordConfirm} type="password" class="form-input mt-1 block w-full" placeholder="•••••••••••••">
      </label> -->
    </div>
    <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Sign up for free">

    {#if useGoogle}
      <button class="Btn-outline _google relative | text-center w-full mt-4 ease-in-out block" type="submit" value="Continue with Google">
        <svg class="inline pb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        <span>
          Continue with Google
        </span>
      </button>
    {/if}
    <!-- <input class="Btn-outline | text-center w-full mt-4 ease-in-out block" type="submit" value="Sign in with Twitter"> -->

    <slot name="terms"></slot>

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
<div class="text-small text-center mt-4">
  Already have an account? <a href={loginLink}>Sign in</a>
</div>












<script>
  import slugify from 'slugify'
	import { browser } from '$app/env';
  import { session } from '$app/stores';
  import { userLogin } from '$plasmid/modules/pocket/'

  export let user = {}, profile = {}, _user, error, message
  export let successLink = "/"
  export let loginLink = "/login"

  let recUsername = true

  export let useGoogle = false


  $: if(profile.name && recUsername) {
    profile.username = slugify(profile.name, {
      lower: true,
      strict: true,
      trim: true,
    })
  }

  

  export let handleSubmit = async () => {
    try {
      message = 'Creating account ...'
      _user = await userSignup({
        email: user.email,
        password: user.password,
        passwordConfirm: user.password,
        profile: profile,
      })
    } catch (e) {
      console.error('Signup error:', e.response)
      let res = e.response
      if (res.data?.data) {
        error = Object.values(res.data.data)[0].message
      } else {
        error = e.response
      }
    }

    if(_user) {
      console.log('Signed up & signed in!', _user)
      goto(successLink)
    }

  }

</script>




<style lang="scss">

</style>