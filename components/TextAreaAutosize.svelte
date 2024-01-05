<!-- 
  
  https://svelte.dev/repl/40f4c7846e6f4052927ff5f9c5271b66?version=3.6.8

  <script>
    import TextArea from "./TextAreaAutosize.svelte";
    let val = `This is some example text`;
  </script>

  <TextArea 
    bind:value={val}  
    minRows={4}
    maxRows={40}
  />

 -->

<script>
  import { onMount } from 'svelte'
  export let id, name
  export let containerClasses = ''
  export let classes = ''
  export let lineheight = 1.6
	export let value = '';
	export let minRows = 4;
	// export let maxRows;
  export let placeholder = ''
  export let required=false
  export let offset=20 // depends on padding / lineheight etc. needs to be manual

  export let textarea = null;
	$: minHeight = `${1 + minRows * lineheight}em`;
	// $: maxHeight = maxRows ? `${1 + maxRows * lineheight}em` : `auto`;

	onMount(async () => {
    // get the number of lines in value text
    // let lines = (value.match(/\n/g) || []).length + 1
    // console.log('init value:', value, lines)
    // let calcHeight = 1 + lines * lineheight
    // // set the height to the number of lines in value text
    // textarea.style.height = `${calcHeight}em`
    // // set the min height
    // textarea.style.minHeight = minHeight
    // // set the max height
    // // textarea.style.maxHeight = maxHeight

    // if preloaded text, make the height as tall as the window 
    textarea.style.height = textarea.scrollHeight + offset + "px"
	});
    


  // $: if(textarea) {
  //   console.log('textarea:', textarea.scrollHeight)
  //   textarea.style.height = "auto"
  //   textarea.style.height = (textarea.scrollHeight + 20) + "px"
  // }
</script>

<!-- <div bind:this={textarea} class="relative {containerClasses}" style="--textareaautosize-lineheight: {lineheight}"> -->
<div class="relative {containerClasses}">
	<!-- <pre
		aria-hidden="true"
		style="min-height: {minHeight}; max-height: {maxHeight}"
	>{value + '\n'}</pre> -->

  <!-- setting style to overflow:hidden causes issues for text areas longer than the window -->
  <!-- if passing in {...$$restProps}, it'll jump a lot!  -->
	<textarea {id} {name} {placeholder} class="{classes}" bind:value {required}
    bind:this={textarea}
    rows={minRows}
    style=""
    on:keyup={(e)=>{
    // console.log('[Profile] Profile changed successfully!')
      // console.log('textarea:', textarea.scrollHeight, e.target.style.height)

      // if scrollheight is as tall as window height, set as window height:
      if(textarea.scrollHeight > window.innerHeight) {
        textarea.style.height = window.innerHeight + "px"
      } else {
        e.target.style.height = "auto"
        e.target.style.height = (e.target.scrollHeight + offset) + "px"
      }
    }} 
  ></textarea>	
</div>



<style>
	
	/* pre, textarea {
		font-family: inherit;
		box-sizing: border-box;
		line-height: var(--textareaautosize-lineheight);
		overflow: scroll;
	}
	
	textarea {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		resize: none;
	} */
</style>