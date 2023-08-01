<!-- 
  Notes

  - make sure to hide #svelte-announcer in print

 -->

<script>

  import _css from "./page.css";
  import { Previewer } from "pagedjs";
  import { browser } from '$app/environment';
  import { onMount, tick } from 'svelte';

  import { toPng } from 'html-to-image';
  import { jsPDF } from 'jspdf';

  import Certificate from './Certificate.svelte'
  
  export let previewElem, sourceElem, editable=false;
  export let event, attendee;
  export let menubarClasses = `Card-solid px-2 py-1`;
  export let printCta = "Print";

  $: if(event && sourceElem) {
    console.log('VisaPreview:', event);
    (async ()=> {
      await tick();
      await preview(sourceElem)
    })();
  };

  // from: https://github.com/nikitasemenchenko6/invoice-generator/blob/master/src/components/InvoiceModal.jsx
  const getPDF = async () => {
    // const dom = document.getElementById('printPreview');
    let dom = document.querySelector('.pagedjs_pages');
    let width = 5.5;
    let height = 8.5;
    let unit = 'in'
    let zoom = 1.25

    return new Promise((resolve, reject) => {
      toPng(dom).then((dataUrl) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = dataUrl;
        img.onload = () => {
          // Initialize the PDF.
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: unit,
            format: [width, height],
          });

          // Define reused data
          const imgProps = pdf.getImageProperties(img);
          const imageType = imgProps.fileType;
          const pdfWidth = pdf.internal.pageSize.getWidth();

          // Calculate the number of pages.
          const pxFullHeight = imgProps.height;
          const pxPageHeight = Math.floor((imgProps.width * height) / width);
          const nPages = Math.ceil(pxFullHeight / pxPageHeight);

          // Define pageHeight separately so it can be trimmed on the final page.
          let pageHeight = pdf.internal.pageSize.getHeight();

          // Create a one-page canvas to split up the full image.
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = imgProps.width;
          pageCanvas.height = pxPageHeight;

          for (let page = 0; page < nPages; page++) {
            // Trim the final page to reduce file size.
            if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
              pageCanvas.height = pxFullHeight % pxPageHeight;
              pageHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width;
            }
            // Display the page.
            const w = pageCanvas.width;
            const h = pageCanvas.height;
            pageCtx.fillStyle = 'white';
            pageCtx.fillRect(0, 0, w, h);
            pageCtx.drawImage(img, 0, page * pxPageHeight, w, h, 0, 0, w, h);

            // Add the page to the PDF.
            if (page) pdf.addPage();

            const imgData = pageCanvas.toDataURL(`image/${imageType}`, 1);
            pdf.addImage(imgData, imageType, 0, 0, pdfWidth*zoom, pageHeight*zoom);
          }

          return resolve(pdf)
        };
      })
      .catch((error) => {
        console.error('[getPDF] Something went wrong!', error);
      });
    })
  };

  async function print() {
    if(!browser) return;
    // await preview(sourceHtml)
    // await preview(sourceElem); // doing this removes any changes made to preview
    window.print();
  };

  async function preview(html) {
    if(!browser) return;
    await tick();
    const previewer = new Previewer();
    console.log("[Preview]:", html)
    previewElem.innerHTML = ""
    if (html && previewElem) {
      // previewer.preview(html, [{ _: css }], previewElem)
      let flow = await previewer.preview(html.innerHTML || html, [{ _: _css }], previewElem)
      console.log("[Preview] Rendered; total pages", flow.total, { flow });
      console.log("[Preview] Performance: ", flow.performance)
      console.log("[Preview] Final HTML: ", previewElem)
      return flow
    }
    return null;
  };

  // only do this browser-side on load
	// onMount(async () => {
  //   preview(sourceElem)
	// });


</script>




<div class="_content | container">
  <div class="Menubar {menubarClasses}">
    <div class="menu">
      <button class="Btn-outline" on:click={()=>print()}>{printCta}</button>
      <!-- <button class="Btn-outline" on:click={()=>download()}>{"Download"}</button> -->
    </div>
    <div id="editor" 
      class=""
      contenteditable={editable}
      bind:this={sourceElem}
      on:blur={()=>preview(sourceElem)}
      >
        <Certificate {event} {attendee} />
    </div>
  </div>
</div>


<div id="preview-container" class="preview-container | _content mx-auto |">
  <div class="preview-box | container ">
    <div class="text-xs text-gray-500 uppercase | pb-2">Preview</div>
  </div>
  <div id="printPreview" class="preview" contenteditable={editable} bind:this={previewElem} />
</div>


<style lang="scss" global>
  h3 {
    @apply text-xl font-bold pt-0 pb-1;
    padding-top: 0 !important;
  }

  #printPreview {
    outline: none !important
  }

  @media screen {
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