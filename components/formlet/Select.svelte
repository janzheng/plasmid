
<div id="formlet--{id}" class={`Formlet Formlet-select ${styles['formletClasses']}`} style={listOpen? 'z-index: 8888': ''}>
	<div class="_form-control">
	  <slot name="label">
			<div class="{styles['labelContainer']||'_md-pfix'}">
				{#if label}<label class={`Formlet-label ${styles['labelClasses']||''}`} for={id}>{@html marked(label)}</label>{/if}
				{#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
			</div>
	  </slot>
    {#if value}
  		<Select items={options} bind:listOpen={listOpen} bind:this={ref} {...selectOptions} bind:selectedValue={value} on:select={handleInput}/>
    {/if}
		<!-- 
			<Select items={options} 
				isCreatable={true} 
				placeholder={`Choose something`}
				isMulti={true}
				bind:value /> 
		-->
	</div>
</div>




<script>
  import { onMount } from 'svelte';
	import Select from 'svelte-select'
  import marked from 'marked';
	
	export let form, handleChange, errors, touched
  export let field = {}
  let value = undefined, ref
  let {id, name, label, description, placeholder, styles={}, type, options=[], selectOptions={} } = field
  let listOpen
  id = id || name // make sure id exists by id or name values

	$: { // unhandled vars
		errors, touched
	}

  // $: if($form[id]) { // bind value
  //   value = $form[id]
  // }
	onMount(async () => {
		if($form[id]) {
			value = $form[id]

      if(value && value.length > 0) {
        value.map((val,i) => {
          if(!val) // remove empty ones as a guard
            value.splice(i)
        })
      }
		}
	})

  const handleInput = () => {
  	// console.log('input: ', value)
  	// create a fake node for svelte forms
  	let e = ref
  	e = {target: {
  		name: id,
  		value: value
  	}}
  	// console.log('input: ', value, id, e)
  	handleChange(e)
  }
</script>

