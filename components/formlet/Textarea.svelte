
<div id="formlet--{id}" class={`Formlet Formlet-textarea ${styles['formletClasses']||''}`}>
  <slot name="label">
    <div class="{styles['labelContainer']||'_md-pfix'}">
      {#if label}<label class={`Formlet-label ${styles['labelClasses']||''} ${$errors[id] && $errors[id].length>0 ? '_errortext' : ''}`} for={id}>{@html marked(label)}</label>{/if}
      {#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
    </div>
  </slot>

  <textarea
    id={id}
    name={name}
    on:change={handleInput}
    on:blur={handleInput}
    on:keyup={debounce(handleInput, 100)}
    value={value}
    placeholder={placeholder}
    class={`_form-input ${styles['fieldClasses']||''} ${$errors[id] && $errors[id].length>0 ? '_form-error' : ''}`}
  	rows={rows}
  />

  {#if $errors[id] && $errors[id].length>0}
		<slot name="error">
  		<div class="_error">{$errors[id]}</div>
		</slot>
  {/if}
</div>


<script>
  import marked from 'marked';
  import debounce from 'lodash.debounce'

	export let form, handleChange, errors
  export let field = {}
  let value=''
  let {id, name, label, description, placeholder, styles={}, type, rows=4} = field
  id = id || name // make sure id exists by id or name values

  $: if($form[id]) { // bind value
    value = $form[id]
  }

  const handleInput = (e) => {
    $form[id] = e.target.value // this is more control than bind:value
    handleChange(e)
  }
</script>