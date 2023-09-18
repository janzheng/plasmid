

<div class="UploadBar {UploadBarClasses}">

  <div class="UploadBar-Buttons">
    <button class="UploadBar-Button {uploadButtonClasses}"
      on:click={()=>handleUpload()}
    >
      Upload ({fileObjects.length}) Files
    </button>
  </div>

  {#if showStatus}
    <div class="UploadBar-Status  {uploadStatusClasses}">
      <!-- <details open> -->
        <div class="{uploadSummaryClasses}">Upload Status [{uploadResults.length}/{fileObjects.length} done]</div>
        <!-- <summary class="{uploadSummaryClasses}">Upload Status [{uploadResults.length}/{fileObjects.length} done]</summary> -->
        <div class="UploadBar-Status-Details {uploadStatusDetailsClasses}">
          <!-- {#each uploadResults as result}
            <div class="pt-1"><a href="{result?.results?.[0]?.permalink}">{result?.results?.[0]?.permalink}</a></div>
          {/each} -->
          {#each $uploadStatuses as status}
            {@const filename = get(status)?.filename}
            {@const filestatus = get(status)?.status}
            {@const url = get(status)?.url}

            <!-- only show results that map to fileObjects -->
            {#if fileObjects.find(f=>f.file?.name == filename)}
              <div class="status-item">
                <div>
                  {filestatus}: {filename}
                </div>
                {#if url}
                  <div class="">
                    <a href={url}>{url}</a>
                  </div>
                {/if}
              </div>
            {/if}

            
          {/each}
        </div>
      <!-- </details> -->
    </div>
  {/if}

</div>













<script>
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';



  import { PUBLIC_PDR2_AUTH, PUBLIC_PDR2_ENDPOINT, PUBLIC_PDR2_SCOPE } from '$env/static/public';
  import * as store from 'svelte/store';

  import { uploadFileToR2, uploadFileWithPresignedUrl } from '$plasmid/utils/r2/r2';

  
  const dispatch = createEventDispatcher();

  // export let mode = "cf" // "presigned" | "cf"
  export let mode = "presigned" // "presigned" | "cf"

  export let scope = PUBLIC_PDR2_SCOPE;
  export let fileObjects = [];
  export let showStatus = true;
  
  export let UploadBarClasses = "";
  export let uploadButtonClasses = "Btn-solid | mb-2";
  export let uploadStatusClasses = "mt-2";
  export let uploadSummaryClasses = "mt-2 cursor-pointer";
  export let uploadStatusDetailsClasses = "";
  
  // statusStores & statusList will update reactively to any status changes
  export let uploadStatuses = store.writable([]), statusSubscriptions=[], statusList=[];
  export let uploadResults = [];
  export let uploadFinished = false, uploadStatus;



  $: if(fileObjects) {
    console.log('[uploadBar] fileObjects:', fileObjects)
  }

  async function handleUpload() {
    if(!fileObjects || fileObjects.length < 1) return null
    
    await Promise.all(fileObjects.map(async fileObject => {
      const file = fileObject.file;
      const status = store.writable({}); // each file gets its own store (is this bad??)
      $uploadStatuses = [...$uploadStatuses, status];

      let result
      let fileScope = scope

      if(fileObject.folderPath)
        fileScope += "/" + fileObject.folderPath

      if(mode == "cf") {
        result = await uploadFileToR2({ file, scope: fileScope, status });
      } else {
        // presigned url
        result = await uploadFileWithPresignedUrl({ file, scope: fileScope, status });
      }

      uploadResults = [...uploadResults, result];
      return result
    }))

    uploadFinished = true
    uploadStatus = "Finished"
    dispatch('uploadFinished', uploadResults)  
    console.log('uploadFinished', uploadResults)

    // unsubscribe every store in $statusStores for cleanup
    statusSubscriptions.forEach(unsubscribe => {
      unsubscribe();
    });
    

  }

  // $: if(uploadResults) {
  //   // uploads in progress
  //   console.log('uploadResults', uploadResults)
  // }



  $: if($uploadStatuses) {
    // uploads in progress; this updates statusStores and statusList
    // console.log('statuslist stores:', $statusStores)
    for (const status of $uploadStatuses) {
      // console.log('status:', get(status))
      let unsubscribe = status.subscribe((fileStatus) => {
        let index = statusList.findIndex(item => item.filename === fileStatus.filename);

        let fileObject = fileObjects.find(item => item.path === "/"+fileStatus.filename);
        if(fileObject)
          fileObject.fileStatus = fileStatus; // update status back to file object

        if (index !== -1) {
          statusList[index] = fileStatus;
        } else {
          statusList.push(fileStatus);
        }
        statusList = statusList; // reflexive update
      });
      statusSubscriptions.push(unsubscribe) // for clean up
    }
    dispatch('uploadStatus', statusList)  
  }
</script>