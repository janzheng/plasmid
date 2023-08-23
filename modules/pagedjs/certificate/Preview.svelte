

<script>

  import pagestyle from "./page.css?inline";
  import { Previewer } from "pagedjs";
  import { browser } from '$app/environment';
  import { onMount, tick } from 'svelte';

  import { toPng } from 'html-to-image';
  import { jsPDF } from 'jspdf';

  import Letter from './Certificate.svelte'
  
  export let previewElem, sourceElem, editable=false;
  export let contentData;
  export let menubarClasses = `Card-solid px-2 py-1`;
  export let menuClasses = ``;
  export let printCta = "Print";
  export let showPreview = true;
  export let attendee, event;

  let pageFlow, previewer;





  async function print() {
    if(!browser) return;
    showPreview = true;
    await preview(sourceElem);

    // await preview(sourceElem) // doing this removes any changes made to preview
    window.print()
    showPreview = false;
  }


  // $: if(sourceElem && contentData) {
  $: if(sourceElem) {
    // update preview if sourceElem changes
    (async () => {
      await tick();
      if(showPreview) {
        // tick required to update invoice before sourceElem is updated
        await preview(sourceElem)
      }
    })()
  } 

  export const preview = async (html) => {
    if(!browser) return;
    await tick();
    console.log("[Preview] HTML::", html)
    previewElem.innerHTML = ""
    if (html && previewElem) {
      // previewer.preview(html, [{ _: css }], previewElem)
      previewer = new Previewer();
      pageFlow = await previewer.preview(html.innerHTML || html, [{ _: pagestyle }], previewElem)
      console.log("[Preview] Rendered: total pages", pageFlow.total, { pageFlow });
      console.log("[Preview] Performance: ", pageFlow.performance)
      console.log("[Preview] Final HTML: ", previewElem)
      return pageFlow
    }
    return null
  };

  // this is taken care of by $: sourceElem instead; having both creates TWO copies for some reason
  // only do this browser-side on load
	// onMount(async () => {
  //   preview(sourceElem)
	// });

</script>

<div class="printMenu {menuClasses}">
  <slot name="PrintSlot" />
    <!-- <div class="text-2xl font-serif font-bold mb-4">Evergreen Certificate</div> -->
  <!-- <div class="p-4"> -->
    <div class="flex items-center gap-2">
      <button class="Btn-outline" on:click={()=>{preview(sourceElem); showPreview=!showPreview}}>{showPreview?"Hide Preview":"Show Preview"}</button>
      <button class="Btn-outline" on:click={()=>print()}>{printCta}</button>
    </div>
    <div class="font-serif pt-2">If the print preview doesn’t look right, please use Chrome, and/or try refreshing. Firefox and Edge are know to have issues. <br>If you’re having problems, you can also email me (jan@phage.directory) and I can help,</div>
    <!-- <button class="Btn-outline" on:click={()=>download()}>{"Download"}</button> -->
  <!-- </div> -->
</div>

<div class="AcceptLetter">
  <div class="_content | container" id="preview">
    <div class="Menubar {menubarClasses}">
      <!-- <div class="menu p-4">
        <button class="Btn-outline" on:click={()=>print()}>{printCta}</button>
        <button class="Btn-outline" on:click={()=>download()}>{"Download"}</button>
      </div> -->
      <div id="editor" 
        class="hidden"
        contenteditable={editable}
        bind:this={sourceElem}
        on:blur={()=>preview(sourceElem)}
        >
          <Letter {attendee} {event} {contentData} />
      </div>
    </div>
  </div>

  <div class="Preview" class:hidePreview={!showPreview}>
    <div id="preview-container" class="preview-container | _content mx-auto">
      <div class="preview-box | container ">
        <div class="text-xs text-gray-500 uppercase | pb-2">Preview</div>
      </div>
      <div id="printPreview" 
        contenteditable={editable}
        class="" bind:this={previewElem} 
        />
    </div>
  </div>
</div>


<style lang="scss" global>
  @import "./page.css?inline";


  h3 {
    @apply text-xl font-bold pt-0 pb-1;
    padding-top: 0 !important;
  }
  @media print {
    .hidePreview, .Preview, .AcceptLetter {
      display: block !important;
    }
    .printMenu {
      display: none !important;
    }
  }
  @media screen {
    .hidePreview {
      display: none;
    }
    // .pagedjs_page {
    #printPreview {
      background: white;
      border: 1px solid #d6d9dc;
      border-radius: 4px;
    }
  }

  .pagedjs_page {
    --pagedjs-margin-top: .5in;
    --pagedjs-margin-right: .5in;
    --pagedjs-margin-left: .5in;
    --pagedjs-margin-bottom: .5in;
  }
  
</style>