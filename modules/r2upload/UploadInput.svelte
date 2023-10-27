

<form class="Upload {classes}"
  on:submit|preventDefault={async ()=>{
    // await uploadFile() // small files only; uses CF-worker
    await uploadFileWithPresignedUrl(scope) // straight to S3
  }}
>
  {#if showLabel}
    <label class="_form-label" for="file">{uploadLabel}</label><br>
  {/if}
  {#if showScope}
    <label class="_form-label" for="file">Scope: [{scope}]</label><br>
  {/if}

  {#if mode == 'simple'}
    <div class="mb-4">
      <input 
        class="form-control _form-file mb-2" id="file" type="file" name="file"
        bind:files multiple={multiple||null} webkitdirectory={webkitdirectory||null}
      >
    </div>
  {:else}
    <div class="grid mb-4 ">
      <label for="dropzone-file" class="items-center relative w-full cursor-pointer overflow-scroll p-4 pt-10 text-center | {dropClasses}"
      on:drop={async (e)=>{fileObjects = [...fileObjects, ...await handleDrop(e)]}}
      >
        <div class="text-center items-center pt-5 pb-6 ">
          <svg aria-hidden="true" class="mx-auto mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">{@html uploadHtmlText}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{fileText}</p>
        </div>
        <input id="dropzone-file" type="file" class="cursor-pointer absolute top-0 left-0 w-full h-full opacity-0" bind:files={files} multiple />
      </label>
    </div>
  {/if}

  <!-- {#if showPreview}
    <div class="Upload-Preview">
      <PreviewFiles {files} {status} {showStatusMessage} {previewCardClasses} {preview}/>
    </div>
  {/if}
  {#if showUploadBtn}
    <div class="Upload-Button">
      <input class="Btn-solid | mb-2" type="submit" value="Upload File">
    </div>
  {/if} -->

</form>



<script>

  import * as store from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

  import PreviewFiles from './PreviewFiles.svelte' 

  import { PUBLIC_PDR2_AUTH, PUBLIC_PDR2_ENDPOINT, PUBLIC_PDR2_SCOPE } from '$env/static/public';
  // import { getFileImagePreview } from '$plasmid/utils/uploads/fileImagePreview';
  // import { getFileHash } from '$plasmid/utils/uploads/fileHash';
  // import { uploadFileToR2, requestPresignedUrl, uploadPresignedUrl } from '$plasmid/utils/r2/r2';
  import { handleDrop } from '$plasmid/utils/r2/utils';
  

  // can either pass details back as a bind:fileUpload or use a store
  // status store receives all messages during upload
  export let files=[], fileObjects=[];

  export let showLabel = false, showScope = false; 
  export let mode  = 'drag'; // = 'simple' // 'drag' is default since it handle complex interactions
  export let classes = '';
  export let uploadLabel = 'File upload';
  export let dropClasses = `h-64 | rounded-lg border-2 | bg-gray-50  border-gray-300 border-dashed dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 `;
  export let uploadHtmlText = `<span class="font-semibold">Click to select files</span>, or drag and drop folders and files`;
  export let fileText = `SVG, PNG, JPG or GIF (MAX. 800x400px)`;
  export let scope = PUBLIC_PDR2_SCOPE;

  // if these are both true, file selection will be disabled by Chrome (only folders work)
  export let multiple = false, webkitdirectory = false;


  // convenient addons; these can be set to false and implemented in the parent
  // export let showPreview = false; // set to false when controlled by external form upload flow
  // export let showUploadBtn = false;


  // export let status = store.writable({});
  // export let fileUpload = {};

  
  // export let verbose = false;
  // export let showStatusMessage = true;
  // export let showHash = true; // false;
  // export let ctaCardClasses = ``;




  // file preview & CID hash
  // export let preview, urlPreview; // can pass an external URL in for image preview
  // let hash;a

  /* 
    Object that wraps around a file:
    [{
      file: File,
      path, "test-folder/some-file.jpg", // w/ folders
      path, "/some-root-file.jpg" // w/o folders
    }]
  */
  $: if (fileObjects.length > 0) {
    // console.log('fileObjects updated', fileObjects);

    // build a hash of each, then filter out repeated items
    // this can happen easily if uploading a folder + its containing contents

    // async function getHash() {
    //   hash = await getFileHash({file: files[0]})
    //   $status['hash'] = hash
    // }
    // getHash();

  }

  $:if(files && files.length > 0) {
		for (const file of files) {
      fileObjects = [...fileObjects, {
        file,
        path: (file.webkitRelativePath || file.name),
        folderPath: file.webkitRelativePath && file.webkitRelativePath.split("/").slice(0, -1).join("/"),
        // hash: getFileHash && getFileHash({file}),
      }]
    }
    // filter fileObjects for file.path to be unique
    // reactivity will set files to DUPLICATE (annoying)
    // this also prevents you from uploading many of the same files from the same path
    fileObjects = fileObjects.filter((v, i, a) => a.findIndex(t => t.path === v.path) === i)

    // filter out fileObjects where path includes ".DS_Store" (Mac thing)
    fileObjects = fileObjects.filter(fileObject => !fileObject.path.includes(".DS_Store"));
    
    console.log('file objects...', files, fileObjects)
  }





	// const dispatch = createEventDispatcher();
  // // on:uploaded={e => { console.log('uploaded', e.detail)}}
	// const uploadFinished = () => dispatch('uploaded', fileUpload);
  
  // can trigger this externally to upload files
  // export const uploadFile = async () => {
  //   if(files && files[0]) {
  //     console.log('...uploading file', files?.[0]);
  //     fileUpload = await uploadFileToR2(files?.[0], status);
  //     uploadFinished();
  //     return fileUpload;
  //   }
  //   return false;
  // };


  // // this allows for super-large files, as it goes around CF Worker
  export const uploadFileWithPresignedUrl = async (scope) => {
    try {
      const presignedUrl = await requestPresignedUrl({file: files[0], scope});
      console.log('Presigned URL:', presignedUrl);
      let result = await uploadPresignedUrl(presignedUrl, {file: files[0]});
    } catch (error) {
      console.error('[uploadFileWithPresignedUrl] Error:', error);
    }
  };


</script>