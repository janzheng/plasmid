

<form class="Upload {classes}"
  on:submit|preventDefault={async ()=>{
    fileUpload = await uploadFileToR2(files?.[0], status)
    uploadFinished()
  }}
>

  {#if mode == 'simple'}
    <div class="mb-4">
      {#if showLabel}
        <label class="_form-label" for="file">{uploadLabel}</label><br>
      {/if}
      <input 
        class="form-control _form-file mb-2" id="file" type="file" name="file"
        bind:files
      >
    </div>
  {:else}
    {#if showLabel}
      <label class="_form-label" for="dropzone-file">{uploadLabel}</label><br>
    {/if}
    <div class="grid mb-4 ">
      <label for="dropzone-file" class="items-center relative w-full cursor-pointer overflow-scroll p-4 pt-10 text-center | {dropClasses}">
        <div class="text-center items-center pt-5 pb-6 ">
          <svg aria-hidden="true" class="mx-auto mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">{@html uploadHtmlText}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{fileText}</p>
          <!-- {#each files as file}
            <p class="text-xs text-gray-500 dark:text-gray-400">{file.name}</p>
          {/each} -->
        </div>
        <input id="dropzone-file" type="file" class="cursor-pointer absolute top-0 left-0 w-full h-full opacity-0" bind:files={files} multiple />
      </label>
    </div>
  {/if}

  {#if files && files.length > 0}
    <div class = "Card-light">
      <input class="Btn-solid" type="submit" value="Upload File">
      {#if $status.message}
        <span class="pl-2">{@html $status.message}</span>
      {/if}

      {#if showPreview}
        <!-- {#each Array.from(files) as file} -->
        <div class="Card-flat p-4 mt-4">
          {#if showHash}
            <p class="break-all">Content ID: {hash}</p>
          {/if}
          {#if verbose}
            <h3 class="pt-0">Preview:</h3>
            <p>{files?.[0]?.name} ({files?.[0]?.size} bytes) || CID: {hash}</p>
          {/if}
          <div>
            {#if preview && files[0].type.includes('image')}
              <img src={preview} alt="Preview" />
            {/if}
          </div>
        </div>
        <!-- {/each} -->
      {/if}
    </div>
  {/if}

</form>







<script>

  // todo: handle multiple files

  import * as store from 'svelte/store'
	import { createEventDispatcher } from 'svelte';

  import { getFileImagePreview } from '$plasmid/utils/uploads/fileImagePreview' 
  import { getFileHash } from '$plasmid/utils/uploads/fileHash' 
  import { uploadFileToR2 } from '$plasmid/utils/r2/r2' 
  

  // can either pass details back as a bind:fileUpload or use a store
  // status store receives all messages during upload
  export let files = []
  export let status = store.writable({})
  export let showLabel = true
  export let mode  = 'drag' // = 'simple' // 'drag' is default
  export let fileUpload = {}
  export let verbose = false
  export let showPreview = true
  export let showHash = true
  export let classes = ''
  export let uploadLabel = 'File upload'
  export let dropClasses = `h-64 | rounded-lg border-2 | bg-gray-50  border-gray-300 border-dashed dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 `
  export let uploadHtmlText = `<span class="font-semibold">Click to upload</span> or drag and drop`
  export let fileText = `SVG, PNG, JPG or GIF (MAX. 800x400px)`


	const dispatch = createEventDispatcher();
  // on:uploaded={e => { console.log('uploaded', e.detail)}}
	const uploadFinished = () => dispatch('uploaded', fileUpload);

  // file preview & CID hash
  let preview, hash
  $:if(files && files[0]) {
    async function getPreview() {
      preview = await getFileImagePreview({file: files[0]})
      $status['preview'] = preview
    }
    getPreview()

    async function getHash() {
      hash = await getFileHash({file: files[0]})
      $status['hash'] = hash
    }
    getHash()
  }






</script>