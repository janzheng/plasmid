

{#if browser && url}
  <div class="twitter-box inline-block overflow-scroll" style="height:{boxheight}" >
    <a class="twitter-timeline" data-width={width} data-height={height} data-tweet-limit={limit} href="{url}">Tweets by {name}</a> 
  </div>
{/if}

<script>
  import { browser } from "$app/environment"
  import { onMount } from "svelte";

  import twitter from '$plasmid/utils/twitter.js'

  // setting limit overrides the height
  export let name = "PhageAustralia";
  export let url = `https://twitter.com/${name}?ref_src=twsrc%5Etfw`;
  export let width=500, height=2100, limit, boxheight
  height=height

	onMount(async () => {
    twitter.loadAPI(true)
  });

</script>