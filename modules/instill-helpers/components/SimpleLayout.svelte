
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

<div class="Instill-layout | " >
  <div class="Instill-layout-header | bg-gray-100 p-2">
    <div class="Card-lighter | _content-narrow | flex items-center">
      <div class="flex-1">
        {#if dev}
          <strong>dev</strong>
        {/if}
        <a class="inline-block" href="{baseConfig.base_url}">Directory</a>
      </div>
      <div class="flex | flex-col | items-end">
        <AccountLogin {baseConfig} classes='--white' hideComponent={false} />
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
 