<!-- 
  Notes

  - make sure to hide #svelte-announcer in print

 -->

<script>

  import _css from "./page.css";
  import { Previewer } from "pagedjs";
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  import Invoice from './Invoice.svelte'
  
  export let previewElem, sourceElem;
  export let invoice, payee, payer;

  async function print() {
    if(!browser) return;
    // await preview(sourceHtml)
    await preview(sourceElem)
    window.print()
  }

  async function preview(html) {
    if(!browser) return;
    const previewer = new Previewer();
    console.log("[Preview]:", html)
    previewElem.innerHTML = ""
    if (html && previewElem) {
      // previewer.preview(html, [{ _: css }], previewElem)
      let flow = await previewer.preview(html.innerHTML || html, [{ _: _css }], previewElem)
      console.log("[Preview] Rendered; total pages", flow.total, { flow });
      console.log("[Preview] Performance: ", flow.performance)
      return flow
    }
    return null
  }

  // only do this browser-side on load
	onMount(async () => {
    preview(sourceElem)
	});

</script>

<div class="_content | container mb-8">
  <div class="Card-solid px-2 py-1">
    <div class="menu">
      <button class="Btn-outline" on:click={()=>print()}>Print</button>
    </div>
    <div id="editor" 
      class="hidden"
      contenteditable="true"
      bind:this={sourceElem}
      on:blur={()=>preview(sourceElem)}
      >
        <Invoice {invoice} {payee} {payer} />
    </div>
  </div>
</div>


<div id="preview-container" class="preview-container | _content mx-auto">
  <div class="preview-box | container ">
    <div class="text-xs text-gray-500 uppercase | pb-2">Preview</div>
  </div>
  <div id="printPreview" class="" bind:this={previewElem} />
</div>


<style lang="scss" global>
  h3 {
    @apply text-xl font-bold pt-0 pb-1;
    padding-top: 0 !important;
  }

  @media screen {
    .pagedjs_page {
      background: white;
      border: 1px solid #d6d9dc;
      border-radius: 4px;
    }
  }

</style>