
<!-- 

  This is a simple layout component that can be used to wrap any content. 
  It is used in the instill route to wrap the content of the instill page.

 -->

<script>

  import { browser } from '$app/environment';
  // import { baseConfig } from '$instill/instill-config'
  import * as config from '$instill/instill-config'
  import * as configPreview from '$instill/instill-config-preview'

  import Head from '$lib/components/shared/Head.svelte'
  import { Head as ConfigHead } from '$lib/config.js'

  import { dev } from '$app/environment';
  import { env } from '$env/dynamic/public';
  let baseConfig, orgSpaces
  if(env.PUBLIC_PREVIEW==="true") {
    baseConfig = configPreview.baseConfig
    orgSpaces = configPreview.orgSpaces
  } else {
    baseConfig = config.baseConfig
    orgSpaces = config.orgSpaces
  }

  // import { isCredentialed } from '$instill/instill-store'
  // import SimpleLogin from '$instill-helpers/components/SimpleLogin.svelte';
  import AccountLogin from '$instill-helpers/components/AccountLogin.svelte';
  export let path;

	import NProgress from 'nprogress';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	// NProgress css
	import 'nprogress/nprogress.css';


  let loaded = false;
  let narrowClass = '';

	NProgress.configure({
		// Full list: https://github.com/rstacruz/nprogress#configuration
		minimum: 0.4,
    easing: 'ease', 
    speed: 800
		// minimum: 0.16
	});
	beforeNavigate(() => {
    // console.log('before nav!')
    NProgress.start();
    loaded = false
  });
	afterNavigate(() => {
    loaded = true
    NProgress.done();
  });


</script>


{#key $ConfigHead}
  <Head />
{/key}


env.PUBLIC_PREVIEW: {env.PUBLIC_PREVIEW}

<div class="Instill-layout | " >
  <div class="_content-narrow">
    <div class="Instill-layout-header | flex items-center gap-4 grid-gap">
      <a class="flex-1 mr-2" rel=prefetch href="/">
        <img class="Header-img inline align-sub " src="/instill-text.png" alt="Instill Science" style="width: 120px;">
      </a>
      {#if dev}
        <strong>dev</strong>
      {/if}
      <div class="Card-lighter | self-end  | flex items-center | mb-0">
        <div class="flex-1">
          <a class="inline-block pr-2 {path == '/' ? 'font-bold':''}" href="{"/"}">home</a>
          <a class="inline-block pr-2 {path.includes('/about') ? 'font-bold':''}" href="{"/about"}">about</a>
          <a class="inline-block pr-2 {path.includes('/directory') ? 'font-bold':''}" href="{"/directory"}">spaces</a>
        </div>
        <div class="flex | flex-col | items-end | pl-4">
          <AccountLogin {baseConfig} doLoginCheck={true} showLoggedinInfo={false} classes='--white' hideComponent={false} />
        </div>
      </div>
    </div>

  </div>

  <!-- use wide format for profiles -->

  <div class="Instill-content | {path?.includes('/profiles/') ? '' : '_content-narrow'} ">
    <slot />
  </div>
</div>


 
<style lang="scss" global>

  #nprogress .bar {
    height: 3px;
  }

  #nprogress .spinner {
    display: none !important;
  }
</style>
 