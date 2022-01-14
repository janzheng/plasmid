
<span class="Switch">
  {#if value}
    {#if showWhenTrue}
      <button class="Switch-btn _spanBtn _margin-bottom-none {classes} {classesTrue}" on:click={()=>{setFalse()}}>{hideText}</button>
    {/if}
  {:else}
      <button class="Switch-btn _spanBtn _margin-bottom-none {classes} {classesFalse}" on:click={()=>{setTrue()}}>{showText}</button>
  {/if}
</span>


<script>

  export let hideText = 'hide', showText = 'show', handler=null, showWhenTrue=true
  export let value = true, classes="_font-small __text", classesTrue='', classesFalse=''

  let setTrue = () => {
    value=true

    if(handler)
      handler()
  } 
  let setFalse = () => {
    value=false

    if(handler)
      handler()
  } 

</script>