
<!-- 
  note that the <input>s are sent to the form in which this component resides
  - this is sent every time a verified command is used!
  - is this janky? yes. does it work?! yes!

  todo: add verification on sign in, maybe add a session cookie?

  most styling needs to be set outside of this component
-->
<!-- <div class="AccountLogin Card-solid {classes} {isHidden ? 'hidden':''} "> -->
<div class="AccountLogin {classes} {isHidden ? 'hidden':''} ">


  <form>
    {#if hideLogin}
      <div class="flex gap-2">
        {#if $commentUser.Username && $commentUser.Password}
          {#if showLoggedinInfo}
            <div class="self-center">{$commentUser.Username}: {maskPassword($commentUser.Password)}</div> 
          {/if}
          <!-- <a href="{editProfileLink}" class="Btn-link ">profile / {$commentUser.Username}</a> -->
          <a href="{editProfileLink}" class="Btn-link ">{$commentUser.Username}</a>
          <button class="Btn-link " on:click={()=>{openLogin()}}>change user</button>
        {:else}
          <a href="{baseConfig?.register_url}" class="Btn-link">sign up</a>
          <button class="Btn-link " on:click={()=>{openLogin()}}>log in</button>
        {/if}
        <div class="hidden">
          <input name="Username" autocomplete="username" bind:value={$commentUser.Username} type="text" class="flex-1 | form-input mt-1 block w-full" placeholder="Username or Email address" required>
          <input name="Password" bind:value={$commentUser.Password} type="password" class="flex-1 | form-input mt-1 block w-full" autocomplete="current-password" placeholder="Passphrase or Password" required>
        </div>
      </div>
    {:else}
      <!-- <div class="grid grid-cols-2 gap-2"> -->
      <div class="flex align-center gap-2">
        <form class="Email-check " method="POST" action="{loginCheckRoute}"
          use:enhance={({ form, data, cancel }) => {
            if(doLoginCheck) {
              error = null
              message = "Signing in..."
  
              return async ({ result, update }) => {
                if (result.data) {
                  if(result.data.success) {
                    console.log('result.data', result.data)
                    $commentUser.isLoggedIn = true
                    console.log('--->', $commentUser)
                    message = null
                    closeLogin()
                  } else {
                    message = "Incorrect username or password."
                    // $commentUser.Username = null
                    // $commentUser.Password = null
                  }
                } 
              }
            } else {
              closeLogin();
            }
          }}
        >
          <input name="Username" autocomplete="username" bind:value={$commentUser.Username} type="text" class="flex-1 | form-input mt-1 block w-full" placeholder="user-name" required>
          <input name="Password" bind:value={$commentUser.Password} autocomplete="current-password" type="password" class="flex-1 | form-input mt-1 block w-full" placeholder="pass-phrase" required>
          <input class="Btn-link self-center" type="submit" value="log in" >
          <!-- <input class="Btn-link self-center" type="submit" value="save"
            on:click={()=>{closeLogin()}}
          > -->
          {#if message}
            <span class="text-sm text-gray-500">{message}</span>
          {/if}
        </form>
      </div>
    {/if}
  </form>
</div>

<script>
	import { enhance } from '$app/forms';
  import { maskPassword } from "$plasmid/utils/auth/auth-helpers";
  import { isUserLoggedIn, commentUser } from '$instill/instill-store';
  
  export let doLoginCheck = false
  export let baseConfig;
  export let hideLogin = true;
  // export let registerLink = baseConfig?.register_url;
  export let editProfileLink = `${baseConfig?.base_url}/profiles/${$commentUser.Username}/edit`;
  let error, message
  // let comment = $commentUser

                    // console.log('--->', $commentUser.Username)
  $: if($commentUser.Username) {
    editProfileLink = `${baseConfig?.base_url}/profiles/${$commentUser.Username}/edit`;
  }

  // $: if(!$commentUser.Username && !$commentUser.Password) {
  //   hideLogin = false;
  // };

  // $: if(comment.Username || comment.Password) {
  //   // console.log('update!', comment.Username, comment.Password)
  //   commentUser.update((n) => {
  //     n.Username = comment.Username
  //     n.Password = comment.Password
  //     return n
  //   })
  // }
  let baseUrl = `${baseConfig?.base_url}`
  export let loginCheckRoute = `${baseUrl}/login?/loginCheck`;

  export let classes = '--white p-1 mt-4 mb-0';
  export let hideComponent = 'loggedIn'; // always
  export let isHidden = false;
  export let showLoggedinInfo = true;
  
  if(hideComponent == 'loggedIn' && $isUserLoggedIn || hideComponent == 'always') {
    isHidden = true; // hides the entire thing, for "login-less" elements like upvotes
  } 
  // else if(hideComponent != 'always') {
  //   isHidden = false
  // }

  // dispatch events?
  // import { createEventDispatcher } from 'svelte';
	// const dispatch = createEventDispatcher();

  function closeLogin() {
    hideLogin = true;

    if(hideComponent == 'loggedIn' && $isUserLoggedIn || hideComponent == 'always') {
      isHidden = true; // hides the entire thing, for "login-less" elements like upvotes
    } 
    if(hideComponent == 'loggedIn' && !$isUserLoggedIn && !hideComponent == 'always') {
      isHidden = false; // un-hides it if not logged in for convenience; will make it pop up in certain places like inline comments
    } 
  };

  function openLogin() {
    hideLogin = false;
  };
</script>