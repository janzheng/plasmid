<!-- 
  Notes

  - make sure to hide #svelte-announcer in print

 -->

<script>

  import _css from "./page.css";
  import { Previewer } from "pagedjs";
  import { browser } from '$app/environment';
  import { onMount, tick } from 'svelte';

  import Invoice from './Invoice.svelte'
  
  export let previewElem, sourceElem, editable=false;
  export let invoice, payee, payer;
  export let menubarClasses = `Card-solid px-2 py-1`;
  export let printCta = "Print"





  async function print() {
    if(!browser) return;
    await preview(sourceElem)
    window.print()
  }

  $: if(sourceElem && (invoice || payer || payee)) {
    // update preview if sourceElem changes
    (async () => {
      await tick();
      // tick required to update invoice before sourceElem is updated
      preview(sourceElem)
    })()
  } 

  export const preview = async (html) => {
    if(!browser) return;
    await tick();
    console.log("[Preview] HTML::", html)
    previewElem.innerHTML = ""
    if (html && previewElem) {
      // previewer.preview(html, [{ _: css }], previewElem)
      const previewer = new Previewer();
      let flow = await previewer.preview(html.innerHTML || html, [{ _: _css }], previewElem)
      console.log("[Preview] Rendered: total pages", flow.total, { flow });
      console.log("[Preview] Performance: ", flow.performance)
      console.log("[Preview] Final HTML: ", previewElem)
      return flow
    }
    return null
  };

  // this is taken care of by $: sourceElem instead; having both creates TWO copies for some reason
  // only do this browser-side on load
	// onMount(async () => {
  //   preview(sourceElem)
	// });

</script>

<div class="_content | container">
  <div class="Menubar {menubarClasses}">
    <div class="menu">
      <button class="Btn-outline" on:click={()=>print()}>{printCta}</button>
    </div>
    <div id="editor" 
      class="hidden"
      contenteditable={editable}
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
  <div id="printPreview" 
    contenteditable={editable}
    class="" bind:this={previewElem} 
    />
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