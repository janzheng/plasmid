

<script>

  import pagestyle from "./page.css?inline";
  import { Previewer } from "pagedjs";
  import { browser } from '$app/environment';
  import { onMount, tick } from 'svelte';

  import { toPng } from 'html-to-image';
  import { jsPDF } from 'jspdf';

  import Letter from './AbstractBook.svelte'
  
  export let previewElem, sourceElem, editable=false;
  export let contentData;
  export let menubarClasses = `Card-solid px-2 py-1`;
  export let menuClasses = ``;
  export let printCta = "Print";
  let showPreview = false;
  export let abstracts, sessions, authors; 
  export let autoPreview = true;

  let pageFlow, previewer;


  async function print() {
    if(!browser) return;
    showPreview = true;
    await preview(sourceElem);

    // await preview(sourceElem) // doing this removes any changes made to preview
    window.print()
    showPreview = false;
  }


  // don't preview manually for abstract book!
  $: if(autoPreview && sourceElem) {
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
  <!-- <div class="p-4"> -->
    <button class="Btn-outline" on:click={()=>{preview(sourceElem)}}>{"Render Preview"}</button>
    <button class="Btn-outline" on:click={()=>print()}>{printCta}</button>
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
          <Letter {abstracts} {sessions} {authors} {contentData} />
      </div>
    </div>
  </div>

  <div class="Preview">
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

  h1 {
    break-before: page;
  }

  .pagedjs_margin-content {
    @apply font-serif;
  }



  /* 
  
    Other stuff
  
  
  */




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



  
    

  #preview {
    display: table-cell;
    vertical-align: top;
    border: 0;
    padding: 0;
    margin: 0;
  }

  #svelte-announcer {
    display: none;
  }
  .container {
    display: block;
  }

  @media print {
    #svelte-announcer, 
    .container {
      display: none;
    }
    #printPreview {
      display: block;
    }
    #preview-container {
      padding: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      left: 0;
      max-width: inherit;
    }
  }

  @media screen {
    #svelte-announcer, 
    .container {
      display: block !important;
    }
  }
    
</style>