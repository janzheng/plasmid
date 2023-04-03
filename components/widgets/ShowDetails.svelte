
<!-- 

  Accordion-like thing

  - can open/close
  - slots for close and open states
  - defaults to closed, but can be switched
  - can trigger functions on open/close

 -->



<div class="ShowDetails {containerClasses}">
  <div class="ShowDetails-Header {headerClasses}" on:click={() => {toggle()}} on:keypress={() => {toggle()}}>
    <slot></slot>
  </div>

  <div class="ShowDetails-Content {contentClasses}">
    {#if isOpen}
      <div class="ShowDetails-Open {openClasses}" >
        <slot name="openSlot" ></slot>
      </div>
    {:else}
      <div class="ShowDetails-Close {closeClasses}">
        <slot name="closeSlot" ></slot>
      </div>
    {/if}
  </div>
</div>



<script>


  export let isOpen=false, openHandler, closeHandler
  export let containerClasses="", headerClasses="", openClasses="", closeClasses="", contentClasses=""

  export let toggle = () => {
    console.log('[ShowDetails] toggle', isOpen)
    isOpen = !isOpen
    if(isOpen && openHandler) openHandler();
    if(!isOpen && closeHandler) closeHandler();
  }

  export const setTrue = () => {
    isOpen=true
    if(openHandler) handler();
  };
  
  export const setFalse = () => {
    isOpen=false
    if(closeHandler) handler();
  };

</script>






<style lang="scss">

</style>