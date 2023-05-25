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

  import Invoice from './Invoice.svelte'
  
  export let previewElem, sourceElem, editable=false;
  export let invoice, payee, payer;
  export let menubarClasses = `Card-solid px-2 py-1`;
  export let printCta = "Print"





  async function print() {
    if(!browser) return;
    // await preview(sourceElem) // doing this removes any changes made to preview
    window.print()
  }


  // from: https://github.com/nikitasemenchenko6/invoice-generator/blob/master/src/components/InvoiceModal.jsx
  const getPDF = async () => {
    // const dom = document.getElementById('printPreview');
    let dom = document.querySelector('.pagedjs_pages');
    let width = 5.5;
    let height = 8.5;
    let unit = 'in'
    let zoom = 1.2

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

  async function download() {
    let pdf = await getPDF()
    // Output / Save
    // window.open(pdf.output('pdf')); // to debug
    pdf.save(`invoice-evg.pdf`);

    // old code tries to use jsPDF but it doesn't work (looks like crap)
    // Bring the page zoom level back to 100%
    // const scale = window.innerWidth / window.outerWidth;
    // if (scale != 1) {
    //     document.body.style.zoom = scale;            
    // }


    // // Get the div
    // let div = document.getElementById('printPreview');

    // // Convert the div to an HTML string
    // let htmlString = div.outerHTML;

    // // Create a new jsPDF instance
    // let pdf = await new jsPDF({
    //   orientation: 'p',
    //   unit: 'pt',
    //   format: 'letter',
    //   putOnlyUsedFonts: true,
    //   compress: true
    // })

    // // Convert the HTML string to a PDF
    // pdf.html(htmlString, {
    //   width: 1200,
    //   windowWidth: 1200,
    //   margin: 15,
    //   // html2canvas: {
    //   //     scale: 0.25 // default is window.devicePixelRatio
    //   // },
    //   callback: function (pdf) {
    //     window.open(pdf.output('bloburl')); // to debug
    //     // Output the PDF as a blob
    //     let blob = pdf.output('blob');
    //     let url = URL.createObjectURL(blob);
    //     let link = document.createElement('a');
    //     link.href = url;
    //     link.download = 'evg-invoice.pdf';
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   }
    // });
  }


  // using Puppeteer looks pretty bad; need to feed CSS and regenerate server-side; can't handle TW
  // async function download() {
  //   if(!browser) return;
  //   await preview(sourceElem)
  //   const bodyComputedStyles = window.getComputedStyle(document.body)

  //   console.log('[Preview] Downloading...', previewElem.innerHTML)
  //   let html = previewElem.innerHTML

  //   const computedStyles = window.getComputedStyle(previewElem)
  //   let cssText = ''
  //   for (let i = 0; i < previewElem.children.length; i++) {
  //     const computedStyles = window.getComputedStyle(previewElem.children[i])
  //     for (let j = 0; j < computedStyles.length; j++) {
  //       const property = computedStyles[j]
  //       const value = computedStyles.getPropertyValue(property)
  //       cssText += `${property}: ${value};\n`
  //     }
  //   }

    
  //   // handles a svelte bug: html += `<div>hello</div>` // https://github.com/sveltejs/svelte/issues/5292
  //   html +=  `<${''}style>:root { ${_css} }</${''}style>`;
  //   const payload = JSON.stringify({ html, cssText })

  //   console.log('---> html:', html)
  //   const response = await fetch("http://localhost:3051/puppeteer/pdf", {
  //     method: 'POST',
  //     body: payload,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })


  //   const blob = await response.blob();
  //   const url = URL.createObjectURL(blob);

  //   // Create a link element
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = 'evg-invoice.pdf'; // Set the desired file name

  //   // Trigger the download
  //   link.click();

  //   // Clean up the URL object
  //   URL.revokeObjectURL(url);
  // }


  $: if(sourceElem && (invoice || payer || payee)) {
    // update preview if sourceElem changes
    (async () => {
      await tick();
      // tick required to update invoice before sourceElem is updated
      await preview(sourceElem)
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

<div class="_content | container" id="preview">
  <div class="Menubar {menubarClasses}">
    <div class="menu p-4">
      <button class="Btn-outline" on:click={()=>print()}>{printCta}</button>
      <button class="Btn-outline" on:click={()=>download()}>{"Download"}</button>
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
    // .pagedjs_page {
    #printPreview {
      background: white;
      border: 1px solid #d6d9dc;
      border-radius: 4px;
    }
  }

</style>