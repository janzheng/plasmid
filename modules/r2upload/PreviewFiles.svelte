

<div class="PreviewFiles">
  {#if !fileObjects || fileObjects.length == 0}
    <div class="PreviewFiles-Item {itemClasses}">
      <div class="p-1">No items</div>
    </div>

  {:else}
    {#each fileObjects as fobj, i}
      {@const file = fobj.file}
      <div class="PreviewFiles-Item {itemClasses}">
        {#if showDetails}
          <div class="grid grid-cols-1-4">
            <!-- <dt class="p-1">Filename:</dt>
            <dd class="p-1">{file.name}</dd> -->
            <dt class="p-1">File Path:</dt>
            <dd class="p-1">{fobj.path}</dd>
            <dt class="p-1">Scope:</dt>
            <dd class="p-1">{fobj.scope || scope}</dd>
            <dt class="p-1">Status:</dt>
            <dd class="p-1">{fobj?.fileStatus?.status || "Not started"}</dd>
            {#if showHash}
              {#await getFileHash({file: fobj.file})}
                <dt class="p-1">IPFS Hash:</dt>
                <dd class="p-1">{hashLoadingLabel}</dd>
              {:then hash}
                <dt class="p-1">IPFS Hash:</dt>
                <dd class="p-1">{hash}</dd>
              {/await}
            {/if}
            <dt class="p-1">Controls</dt>
            <dd class="p-1">
              <div><button class="Btn-link text-sm" on:click={()=>removeItem(i)}>Remove Upload</button></div>
              <UploadBar 
                UploadBarClasses="text-sm"
                uploadButtonClasses="Btn-link mb-2" 
                fileObjects={[fileObjects.find(f => f.path == fobj.path)]}
                {scope} />
            </dd>
          </div>
        {/if}

        <!-- image preview -->
        {#if showImagePreview && file?.type?.includes('image')}
          {#await getFileImagePreview({file: fobj.file})}
            {imageLoadingLabel}
          {:then src}
            <div class="PreviewFiles-Image">
              <img src={src} alt="Preview" />
            </div>
          {/await}
        {/if}
      </div>
    {/each}
  {/if}
</div>






<script>

  // todo: handle multiple files

  import * as store from 'svelte/store';

  import { PUBLIC_PDR2_AUTH, PUBLIC_PDR2_ENDPOINT, PUBLIC_PDR2_SCOPE } from '$env/static/public';
  import { getFileImagePreview } from '$plasmid/utils/uploads/fileImagePreview';
  import { getFileHash } from '$plasmid/utils/uploads/fileHash';
  import UploadBar from '$plasmid/modules/r2upload/UploadBar.svelte' 
  

  // can either pass details back as a bind:fileUpload or use a store
  // status store receives all messages during upload
  export let showDetails = true; // set to false when controlled by external form upload flow
  // export let files = [];
  // export let status = store.writable({});
  export let showImagePreview = true;
  export let showHash = true; // false;

  export let itemClasses = 'Card-white mb-4 overflow-scroll ';

  export let imageLoadingLabel = '(Loading image)';
  export let hashLoadingLabel = '(Loading content hash)';
  export let scope = PUBLIC_PDR2_SCOPE;
  export let fileObjects = [];

  function removeItem(i) {
    console.log('remove item', i)
    fileObjects.splice(i, 1);
    fileObjects=fileObjects; // reflexive update
  }

</script>