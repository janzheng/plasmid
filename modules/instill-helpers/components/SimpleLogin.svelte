
<!-- 
  note that the <input>s are sent to the form in which this component resides
  - this is sent every time a verified command is used!
  - is this janky? yes. does it work?! yes!
-->
<div class="SimpleLogin Card-solid {classes} {isHidden ? 'hidden':''} ">
  {#if hideLogin}
    <div class="flex gap-2 px-4 text-sm">
      {#if $commentUser.Username && $commentUser.Password}
        <div class="self-center">{$commentUser.Username}: {maskPassword($commentUser.Password)}</div> 
        <button class="Btn-link text-sm" on:click={()=>{openLogin()}}>open</button>
      {:else}
        <button class="Btn-link text-sm" on:click={()=>{openLogin()}}>log in</button>
      {/if}
      <div class="hidden">
        <input name="Username" autocomplete="username" bind:value={$commentUser.Username} type="text" class="flex-1 | form-input mt-1 block w-full" placeholder="Username or Email address" required>
        <input name="Password" bind:value={$commentUser.Password} type="password" class="flex-1 | form-input mt-1 block w-full" autocomplete="current-password" placeholder="Passphrase or Password" required>
      </div>
    </div>
  {:else}
    <!-- <div class="grid grid-cols-2 gap-2"> -->
    <div class="flex align-center gap-2">
      <input name="Username" autocomplete="username" bind:value={$commentUser.Username} type="text" class="flex-1 | form-input mt-1 block w-full" placeholder="user-name" required>
      <input name="Password" bind:value={$commentUser.Password} type="password" class="flex-1 | form-input mt-1 block w-full" autocomplete="current-password" placeholder="pass-phrase" required>
      <button class="Btn-link self-center" 
        on:click={()=>{closeLogin()}}
      >update &amp; close</button>
    </div>
  {/if}
</div>

<script>
  import { maskPassword } from "$plasmid/utils/auth/auth-helpers";
  import { isUserLoggedIn, commentUser } from '$instill/instill-store';
  export let hideLogin = true;
  // let comment = $commentUser

  $: if(!$commentUser.Username && !$commentUser.Password) {
    hideLogin = false;
  };

  // $: if(comment.Username || comment.Password) {
  //   // console.log('update!', comment.Username, comment.Password)
  //   commentUser.update((n) => {
  //     n.Username = comment.Username
  //     n.Password = comment.Password
  //     return n
  //   })
  // }

  export let classes = '--white p-1 mt-4 mb-0';
  export let hideComponent = 'loggedIn'; // always
  export let isHidden = false;
  
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