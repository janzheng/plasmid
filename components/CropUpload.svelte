

<!-- <Upload mode='simple' classes="mt-6" uploadLabel="Add an image" on:uploaded={e => { 
  console.log('uploaded', e.detail)
  // comment.ImageUrl = e.detail.url || null
  }} /> -->
<Cropper 
  cropperHeight={height} cropperWidth={width} aspect={aspect} 
  bind:imageFile={imageFile} bind:croppedImage={croppedImage} bind:croppedBlob={croppedBlob} {uploadCta} bind:isSaving={isSaving}
  on:done={async e => {
    console.log('crop done', e.detail, imageFile)
    // comment.ImageUrl = e.detail.url || null
    let blob = e.detail.croppedBlob
    // insert random string into filename to prevent caching
    
    // let filename = imageFile.name.split('.')[0] + '--' + crypto.randomUUID().slice(0, 4) + '.' + imageFile.name.split('.')[1]
    isSaving = true
    let filename = crypto.randomUUID().slice(0, 12) + '--' + encodeURIComponent(imageFile.name)
    fileUpload = await uploadFileToR2(blob, status, filename)
    console.log('upload status:', fileUpload)
    uploadFinished()
    isSaving = false
    }}
>
  <div class="text-gray-700 mb-2">{uploadLabel}</div>
  <slot></slot>
</Cropper>

{#if loud && $status.message}
  <span class="pl-2">{@html $status.message}</span>
{/if}



<script>
  
  import * as store from 'svelte/store'
  import { createEventDispatcher } from 'svelte';
  import { uploadFileToR2 } from '$plasmid/utils/r2/r2' 

  // import Upload from '$plasmid/modules/r2upload/Upload.svelte' 
  import Cropper from '$plasmid/modules/cropper/Cropper.svelte'
  
  export let height = 160, width = 160, aspect = 1
  export let status = store.writable({})
  export let uploadLabel = 'Change avatar'
  export let uploadCta = 'Use image'
  export let isSaving = false
  let croppedImage, croppedBlob, imageFile
  export let fileUpload = null
  export let loud = false

	const dispatch = createEventDispatcher();
  // on:uploaded={e => { console.log('uploaded', e.detail)}}
	const uploadFinished = () => dispatch('uploaded', fileUpload);


</script>

<style global type="text/scss">
</style>
