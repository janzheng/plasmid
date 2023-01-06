
<!-- 

  This is a simple layout component that can be used to wrap any content. 
  It is used in the instill route to wrap the content of the instill page.

 -->

<script>

  // import { baseConfig } from '$instill/instill-config'
  import * as config from '$instill/instill-config'
  import * as configPreview from '$instill/instill-config-preview'
  import { dev } from '$app/environment';
  let baseConfig, orgSpaces
  if (dev) {
    baseConfig = configPreview.baseConfig
    orgSpaces = configPreview.orgSpaces
  } else {
    baseConfig = config.baseConfig
    orgSpaces = config.orgSpaces
  }

  // import { isCredentialed } from '$instill/instill-store'
  // import SimpleLogin from '$instill-helpers/components/SimpleLogin.svelte';
  import AccountLogin from '$instill-helpers/components/AccountLogin.svelte';
  // export let data;

	import { page } from '$app/stores';


	import NProgress from 'nprogress';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	// NProgress css
	import 'nprogress/nprogress.css';

	NProgress.configure({
		// Full list: https://github.com/rstacruz/nprogress#configuration
		minimum: 0.16
	});
 
	beforeNavigate(() => {
    // console.log('before nav!')
    NProgress.start();
  });
	afterNavigate(() => {
    NProgress.done();
  });


</script>

<div class="Instill-layout | " >
  <div class="Instill-layout-header | bg-gray-100 p-2">
    <div class="Card-lighter | _content-narrow | flex items-center">
      <div class="flex-1">
        {#if dev}
          <strong>dev</strong>
        {/if}
        <a class="inline-block" href="/instill">instill home</a>
      </div>
      <div class="flex | flex-col | items-end">
        <!-- signup / login here -->
        <!-- is logged in? {isCredentialed()} -->
        <!-- <SimpleLogin classes='--white' hideComponent={false} /> -->
        <AccountLogin {baseConfig} classes='--white' hideComponent={false} />
        <!-- <div class="">
          <a href="/instill/login">login</a>
        </div> -->
      </div>
    </div>
  </div>

  {#if $page.data.path.includes('/profiles/')}
    <!-- use wide format for profiles -->
      <div class="Instill-content | Instill-profile-layout">
      <slot />
    </div>
  {:else}
    <div class="Instill-content | _content-narrow">
      <slot />
    </div>
  {/if}
</div>



 
<style lang="scss" global>

  #nprogress .bar {
    height: 3px;
  }

  #nprogress .spinner {
    display: none !important;
  }
</style>
 