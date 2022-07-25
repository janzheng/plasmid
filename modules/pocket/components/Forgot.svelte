


<!-- <form class="content" action="/api/form" method="post"> -->
<form class="Card-light" on:submit|preventDefault={handleSubmit}>
  <slot></slot>
  <div class="my-4">
    <div class="grid grid-cols-1 gap-6">
      <label class="block">
        <span class="text-gray-700">Email address</span>
        <input bind:value={email} type="email" class="form-input mt-1 block w-full" placeholder="john@example.com">
      </label>
    </div>
    {#if !requested}
      <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Sign in">
    {/if}

    {#if requested}
      <div class="Card-light mt-4" >
        <p>
          Check your email for the password reset email
        </p>
        <!-- <label class="block">
          <div class="flex">
            <span class="text-gray-700">Token</span>
          </div>
          <input bind:value={token} type="text" class="form-input mt-1 block w-full" placeholder="123456">
        </label>
        <label class="block">
          <div class="flex">
            <span class="text-gray-700">Password</span>
          </div>
          <input bind:value={password} type="password" class="form-input mt-1 block w-full" placeholder="•••••••••••••">
        </label>
        <input class="Btn-solid | text-center w-full mt-4 ease-in-out block" type="submit" value="Reset password"> -->
      </div>  
    {/if}

    {#if error}
      <div class="Card-error | mt-4 ">
        {error?.data?.message}
      </div>
    {/if}
  </div>

</form>







<script>
  import { goto } from '$app/navigation';
  import { requestPasswordReset, confirmPasswordReset } from '$plasmid/modules/pocket/'

  let email, requested = false, User, error, token, password
  export let successLink = "/"

  async function handleSubmit() {
    try {
      if(requested == false) {
        console.log('requesting reset')
        await requestPasswordReset(email)
        requested = true
      } else {
        User = await confirmPasswordReset(token, password)
      }
    } catch (e) {
      error = e.response
    }

    if($User) {
      console.log('Reset & Logged in!', $User)
      goto(successLink)
    }

  }

</script>




<style lang="scss">

</style>