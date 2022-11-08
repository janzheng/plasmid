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
  export let id, name
  export let containerClasses = ''
  export let classes = ''
  export let lineheight = 1.6
	export let value = '';
	export let minRows = 1;
	export let maxRows;
  export let placeholder = ''
  export let required=false
	
	$: minHeight = `${1 + minRows * lineheight}em`;
	$: maxHeight = maxRows ? `${1 + maxRows * lineheight}em` : `auto`;
</script>

<div class="relative {containerClasses}" style="--textareaautosize-lineheight: {lineheight}">
	<pre
		aria-hidden="true"
		style="min-height: {minHeight}; max-height: {maxHeight}"
	>{value + '\n'}</pre>

	<textarea {id} {name} {placeholder} class="{classes}" bind:value {required}></textarea>	
</div>

<style>
	
	pre, textarea {
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
	}
</style>