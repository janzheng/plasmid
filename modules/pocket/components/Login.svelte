


<!-- <form class="content" action="/api/form" method="post"> -->
<form class="Card-light" on:submit|preventDefault={handleSubmit}>
  <slot></slot>
  <div class="my-4">
    <div class="grid grid-cols-1 gap-6">
      <label class="block">
        <span class="text-gray-700">Email address</span>
        <input bind:value={user.email} type="email" class="form-input mt-1 block w-full" placeholder="john@example.com" required>
      </label>
      <label class="block">
        <div class="flex">
          <span class="text-gray-700">Password</span>
          <span class="text-gray-700 align-end text-right flex-1"><a href={forgotLink}>Forgot?</a></span>
        </div>
        <input bind:value={user.password} type="password" class="form-input mt-1 block w-full" placeholder="••••" required>
      </label>
    </div>
    <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Sign in">
    {#if useGoogle}
      <input class="Btn-outline | text-center w-full mt-4 ease-in-out block" type="submit" value="Sign in with Google">
    {/if}
    <!-- <input class="Btn-outline | text-center w-full mt-4 ease-in-out block" type="submit" value="Sign in with Twitter"> -->

    {#if message}
        <div class="Card-success | mt-4 ">
          {message}
        </div>
    {/if}{#if error}
      <div class="Card-error | mt-4 ">
        {error?.data?.message || error}
      </div>
    {/if}
  </div>

</form>
<div class="text-small text-center mt-4">
  Don't have an account? <a href={signupLink}>Create an account</a>
</div>












<script>
  import { goto } from '$app/navigation';
  import { userLogin } from '$plasmid/modules/pocket/'

  export let user = {}, _user, error = '', message
  export let forgotLink = "/forgot-password"
  export let successLink = "/"
  export let signupLink = "/signup"

  export let useGoogle = false

  export let handleSubmit = async () => {

    try {
      message = 'Logging in ...'
      _user = await userLogin(user.email, user.password)
    } catch (e) {
      error = e.response
    }

    if(_user) {
      console.log('Logged in!', _user)
      goto(successLink)
    }
  }

</script>




<style lang="scss">

</style>