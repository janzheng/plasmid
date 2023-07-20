<!-- 

  
 -->

<div class="font-serif">
  <div class="">
    {#if contentData.logoUrl}
      <div class="logo">
        <img src={contentData.logoUrl} width={contentData.logoWidth} alt="Logo Header"/>
      </div>
    {/if}
    
    <div class="letter-header pt-4">
      <!-- <div class="text-sm mt-4 mb-2">Evergreen 2023 Acceptance Letter</div> -->
      <div class=" mt-4 mb-2">{@html marked(contentData.acceptanceText || '')}</div>
    </div>

    <div class="letter-signature | mt-4">
      <div class="pfix">{@html marked(contentData.signature || '')}</div>
    </div>
    
  </div>
</div>

<script>
  import { marked } from 'marked';
  marked.use({
    breaks: true,
  })

  export let contentData;




  contentData = {
    ...contentData,
    logoUrl: "https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23-full-logo.png",
    logoWidth: "240px",

    signature: `<img src="/betty_sig.png" width="380px" />

Dr. Elizabeth Kutter, and the Evergreen Science Committee
Head, Lab of Phage Biology and Emerita Member of the Faculty in Biophysics,
The Evergreen State College
[kutterb@evergreen.edu](kutterb@evergreen.edu)
    `,
  };


</script>