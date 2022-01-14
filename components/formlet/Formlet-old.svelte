

<form class={`${formletClasses.container ? formletClasses.container : '_form-control'}`} on:submit={handleSubmit}>

  {#if form}
    {#each formFields as field}
      <div class={`${formletClasses.formField ? formletClasses.formField : '_margin-bottom'}`}>
        <!-- <svelte:component this={fieldComponents[objAttributes.fType]} {objAttributes} /> -->
        <svelte:component this={fieldComponents[field.fieldType]} 
          field={field} {handleChange} {errors} {form} >
        </svelte:component>
        <!-- <Input field={field} {handleChange} {errors} {form}> -->
          <!-- <label slot="label" for={'Email'}>Gimme yo email</label> -->
          <!-- <label slot="error" class="_error" for={'Email'}>Error message!!</label> -->
        <!-- </Input> -->
      </div>
    {/each}

    {#if formData.settings && formData.settings.submitText}
      <div class="_margin-top">
        <input type="submit" value={formData.settings && formData.settings.submitText} class="_button _width-full _margin-bottom-none-i __action _ease"> 
      </div>
    {/if}

        <!-- {#if $errors.Email}
          <div class="_margin-top">{ $errors.Email }</div>
        {/if} -->
        <!-- {#if success}
          <div class="_margin-top">Success!</div>
        {/if} -->
  {/if}
</form>



<script>
import { goto } from "@sapper/app";
import { getContext, onMount, tick } from "svelte";
import { createForm } from "svelte-forms-lib";
import * as yup from "yup";
import marked from "marked";

import { get } from "svelte/store";

import Input from "@/components/formlet/Input.svelte";
import Textarea from "@/components/formlet/Textarea.svelte";
import Checkbox from "@/components/formlet/Checkbox.svelte";
import Radiogroup from "@/components/formlet/Radiogroup.svelte";
import Checkboxgroup from "@/components/formlet/Checkboxgroup.svelte";
import Select from "@/components/formlet/Select.svelte";
import SelectRadio from "@/components/formlet/SelectRadio.svelte";

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();



const fieldComponents = {
  Input: Input,
  Textarea: Textarea,
  Checkbox: Checkbox,
  Radiogroup: Radiogroup,
  Checkboxgroup: Checkboxgroup,
  Select: Select,
  SelectRadio: SelectRadio,
};

// yup schema: https://www.npmjs.com/package/yup
export let formData, formState, formStore, formletClasses={}
export let formFields = formData.fields

let success = false

let form, errors, state, handleChange, handleSubmit, touched
// let {form, errors, state, handleChange, handleSubmit, touched} = createForm ...

// const { form, errors, state, handleChange, handleSubmit, touched } = createForm(
//   {
//     initialValues: formStore ? get(formStore)["form"] : formData.yup.initialValues,
//     validationSchema: yup.object().shape(formData.yup.validators),
//     onSubmit: async data => {
//       console.log("submit data:", data);
//     }
//   }
// )

$: if(formData) {
  let newForm = createForm(
    {
      initialValues: formStore && get(formStore)["form"] ? get(formStore)["form"] : formData.yup.initialValues,
      validationSchema: yup.object().shape(formData.yup.validators),
      onSubmit: async data => {
        console.log("submit data:", data);
      }
    }
  )
  if(newForm) {
    form = newForm['form']
    errors = newForm['errors']
    state = newForm['state']
    handleChange = newForm['handleChange']
    handleSubmit = newForm['handleSubmit']
    touched = newForm['touched']
  }

}

$: {
  // console.log("[Formlet] formData:", formData);
}

$: if ($touched) {
  // console.log('[Formlet] update', $form)
  success = false;
  formState = $form

  if(formStore) {
    formStore.update(store => {
      store["form"] = $form;
      return store;
    });
  }

  dispatchUpdate()
}

let dispatchUpdate = async () => {
  await tick()
  // console.log('[dispatch::update]',formData, formState)
  dispatch('update', {state: formState, data: formData})
}

// $: console.log('form:', $errors)
</script>


<style type="text/scss">
</style>



