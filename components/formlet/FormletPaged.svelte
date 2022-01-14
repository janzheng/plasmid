

{#if !submitted}
  <form id="formlet-top" class={`Formlet-container __paged ${classes} ${formStyles['formletContainer']||''}`}
    action='{formData['formAction']?formData['formAction']:null}' 
    method='{formData['formAction']?'POST':null}' 
    on:submit={async (e)=>{
      validateAllPages()
      handleSubmit(e)
    }}>

    <!-- {#each formPages as page, curPage} -->
      <div class="Formlet-eachpage-container __page-{curPageNumber}" transition:fade="{{duration: 350}}">
        {#if curPageNumber == 0}
          <div class="{`Formlet-intro ${formStyles['formIntro']||''}`}">
            {#if formData.name}<div class={`${formStyles['formName']||''} Formlet-intro`}>{@html marked(formData.name)}</div>{/if}
            {#if formData.description}<div class={`${formStyles['formDescription']||''} Formlet-page-intro-description`}>{@html marked(formData.description)}</div>{/if}
            {#if surveysCompleted && surveysCompleted>0 && formData.settings && formData.settings.showCompleted}
              <div class={`${formStyles['surveysCompleted']||''} Formlet-page-surveysCompleted`}>
                <span>{formData.settings.completedTextBefore}</span><span>{surveysCompleted}</span><span>{formData.settings.completedTextAfter}</span>
              </div>
            {/if}
          </div>
        {/if}
        <div class="Formlet-page-container __page-{curPageNumber}" transition:fade="{{duration: 350}}">
          <div class="Formlet-page-content-container {formStyles['contentContainer']||''}">
            {#if curPage.name}<div class={`${formStyles['pageName']||''} Formlet-page-title`}>{@html marked(curPage.name)}</div>{/if}
            {#if curPage.description}<div class={`${formStyles['pageDescription']||''} Formlet-page-description`}>{@html marked(curPage.description)}</div>{/if}
            {#if formData.settings && formData.settings.showTOConPages && Array.isArray(formData.settings.showTOConPages) && formData.settings.showTOConPages.includes(curPageNumber) }
              <div class="Formlet-page-TOC {formStyles['pageTOC']||''}" >
                {#if formData.settings.tocText}{@html marked(formData.settings.tocText)}{/if}
                <ul class="Formlet-page-TOC-list _padding-bottom-none">
                  {#each formData.pages as pageName, i}
                    <li class="Formlet-page-TOC-item {i==furthestPageNumber?'__current':''} {i<furthestPageNumber?'__complete':''}">{formData[pageName].label}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
          <div class="Formlet-page-form {formStyles['pageFormClasses']}">
            {#each curPage.fields as field (`${field.name}-${$touched[field.id] || $touched[field.name]}`)}
              <div class={`${formStyles['formletFieldContainer'] || '_margin-bottom'}`}>
                <svelte:component this={isReset ? undefined : fieldComponents[field.fieldType]} 
                  {field} {handleChange} {errors} {form} >
                  <!-- using isReset forces component reset on form reset-->
                </svelte:component>
              </div>
            {/each}
          </div>
          <div class="Formlet-page-pagination _align-vertically {curPageNumber==0?'':'_grid-1-2-xs'}">
            {#if curPageNumber>0}
              <button type="button" class="Formlet-page-pagination-prev _button _margin-none {formStyles['prevButtonClasses']}" on:click={gotoPrevPage(curPage,curPageNumber)}>
                {curPage.prevText || 'Back'}
              </button>
            {:else}
              <!-- empty span for grid purposes -->
              <span></span>
            {/if}
            {#if curPageNumber<formPages.length-1}
              <button type="button" class={`Formlet-page-pagination-next _button _margin-none ${formStyles['nextButtonClasses']} ${curPageNumber==formPages.length-1?'__disabled':''}`} on:click={gotoNextPage(curPage,curPageNumber)}>{curPage.nextText || 'Next Page'}
              </button>
            {/if}


            <slot name="preCheckout">
              <!-- <div>default</div> -->
            </slot>
            
            {#if formData.settings && formData.settings.submitText && curPageNumber == formPages.length-1}
              {#if isSubmitting}
                <button type="submit" class="submittingButtonClasses _button __cta _ease _margin-bottom-none-i {formStyles['submittingButtonClasses'] || ''} ">{formData.settings&&formData.settings.submittingText || "Submitting..."}</button>
              {:else}
                <button type="submit" class="submitButtonClasses _button __action _ease _margin-bottom-none-i {formStyles['submitButtonClasses'] || ''} ">{formData.settings&&formData.settings.submitText || "Submit"}</button>
              {/if}
            {/if}


            <slot name="postCheckout">
              <!-- <div>default</div> -->
            </slot>
          </div>
        </div>
      </div>
    <!-- {/each} -->

    {#if hasPageErrors}

      {#if pageErrorCount > 0}
        <div class="Formlet-page-errors _card _padding __danger _margin-top-2" transition:fade>
          {#if formData.settings && formData.settings.pageErrorText}
            <div class="Formlet-page-errors-message _md-pfix">{@html marked(formData.settings.pageErrorText)}</div>
          {:else}
            <div class="Formlet-page-errors-message">Please correct the following errors</div>
          {/if}
          <ul class="_padding-bottom-none">
            {#if pageErrorCount > 0}
              {#each Object.keys($errors) as errorKey}
                {#if $errors[errorKey].length>0 && !Array.isArray($errors[errorKey])}
                  <!-- <li><button class="__text __textLink" on:click={(e)=>{scrollToAnchor(errorKey)}}>{$errors[errorKey]}</button></li> -->
                  <li><a class="__underline-none __normal" href={`${$page.path}?page=${curPageNumber+1}#${errorKey}`} on:click={(e)=>{e.preventDefault(); scrollToAnchor(`formlet--${errorKey}`)}}>{$errors[errorKey]}</a></li>
                {/if}
              {/each}
            {/if}
          </ul>
        </div>
      {/if}
      {#if pageErrorCount == 0}
        <div class="Formlet-page-errors _card _padding __active _margin-top-2" transition:fade>
          No more errors!
        </div>
      {/if}
    {/if}

  </form>
  <!-- <button class="_button __cta" on:click={resetForm}>Reset</button> -->

  {#if formData.settings && formData.settings.resetButton && formData.settings.resetButtonText}
    <div class="Formlet-reset-form _font-small _margin-top {formData.styles.resetButtonClasses}">
      {formData.settings.resetButtonPreText||''}<button class="__text __action _font-small _padding-left-none-i" on:click={resetForm}>{formData.settings.resetButtonText}</button>
    </div>
  {/if}
{/if}

{#if submitted}
  <div class="Formlet-page-success _margin-top-2 _md-pfix _padding {formStyles['successBox']||''}" transition:fade>
    {@html marked(formData.settings && formData.settings.successText || "Thank you!")}
  </div>

  {#if formData.settings && formData.settings.startOverButton && formData.settings.startOverText}
    <div class="Formlet-reset-form _font-small _margin-top _padding {formData.styles.startOverButtonClasses}">
      {formData.settings.startOverPreText||''}<button class="__text __action _font-small _padding-left-none-i" on:click={resetForm}>{formData.settings.startOverText}</button>
    </div>
  {/if}
{/if}






<script>
import { goto } from "@sapper/app";
import { getContext, onMount, tick, createEventDispatcher } from "svelte";
import { fade, fly } from 'svelte/transition';
import { createForm } from "svelte-forms-lib";
import * as yup from "yup";
import marked from "marked";
import { stores } from '@sapper/app';


import { get } from "svelte/store";
import { scrollToAnchor } from "@/_utils/scrollto.js";
import { zzz } from "@/_utils/helpers.js";

import Input from "./Input.svelte";
import Textarea from "./Textarea.svelte";
import Checkbox from "./Checkbox.svelte";
import Radiogroup from "./Radiogroup.svelte";
import Checkboxgroup from "./Checkboxgroup.svelte";
import Select from "./Select.svelte";
import SelectRadio from "./SelectRadio.svelte";
import CheckInput from "./CheckInput.svelte";
import Descriptor from "./Descriptor.svelte";
import { prevent_default } from "svelte/internal";




const dispatch = createEventDispatcher();

let fieldComponents = {
  Input: Input,
  Textarea: Textarea,
  Checkbox: Checkbox,
  Radiogroup: Radiogroup,
  Checkboxgroup: Checkboxgroup,
  Select: Select,
  SelectRadio: SelectRadio,
  CheckInput: CheckInput,
  Descriptor: Descriptor,
};

// yup schema: https://www.npmjs.com/package/yup
export let formData, formStore, surveysCompleted //, showPageURL=true
export let formStyles = formData['styles'] || {}, isSubmitting=false, submitted=false

export let form, errors, state, handleChange, handleSubmit, handleReset, touched, isValid, isValidating, validateField
export let formPages = [], curPageNumber = 0, furthestPageNumber = 0, curPage
export let classes

let hasPageErrors=false, isReset=false, pageErrorCount=0
const { page } = stores();


$: if(formData || isReset) {
  let newForm = createForm(
    {
      // initialValues: formData.yup.initialValues,
      initialValues: (formStore && get(formStore)["form"]) ? get(formStore)["form"] : formData.yup.initialValues,
      validationSchema: yup.object().shape(formData.yup.validators),
      onSubmit: async data => {
        isSubmitting=true
        if(formData.submitHandler) {
          formData.submitHandler({state: get(form), formData})
        }
        dispatch('submit', {state: get(form), formData})
      }
    }
  )
  
  if(newForm) {
    form = newForm['form']
    errors = newForm['errors']
    state = newForm['state']
    handleChange = newForm['handleChange']
    handleSubmit = newForm['handleSubmit']
    handleReset = newForm['handleReset']
    touched = newForm['touched']
    isValid = newForm['isValid']
    isValidating = newForm['isValidating']
    validateField = newForm['validateField']
  }

  if(formData.pages) {
    formPages = []
    formData.pages.map(page => {
      formPages.push(formData[page])
    })
  } else {
    formPages = [{fields: formData.fields}]
  }

  resetReset()
}

$: if (!formStore || !get(formStore)["form"]) {
  // no store, reset page to 0 — this isn't fool-proof but good enough for ux
  curPageNumber = 0 // reset page
  // if(process.browser && showPageURL) window.history.pushState(`page 1`, `page 1`, `${window.location.href.split('?')[0]}?page=1`)
}

// $: {
//   console.log("[Formlet] formData:", formData);
// }

$: curPage = formPages[curPageNumber]
$: if(curPageNumber > furthestPageNumber) {
  furthestPageNumber = curPageNumber
  // console.log('furthest page number:', furthestPageNumber)
}

$: if ($touched) {
  // console.log('[Formlet] touched update', $touched, $errors, get(form), formData)

  if(formStore) {
    formStore.update(store => {
      store["form"] = get(form);
      store["furthestPageNumber"] = furthestPageNumber
      return store;
    });
  }

  dispatchUpdate()
}

$: if ($errors && formData.settings && formData.settings.logErrors) {
  console.log('[formlet] errors:', $errors)
}

$: if($errors && Object.keys($errors)) {
  // these are page erros that users can correct, and will be updated when users do that
  pageErrorCount=0
  Object.keys($errors).map(errorKey => {
    if ($errors[errorKey].length>0 && !Array.isArray($errors[errorKey]))
      pageErrorCount++
  })
}

$: if(submitted) {
  // this feels helpful but is actually really annoying
  // console.log('formlet submitted! resetting everything ...')
  // don't trigger this automatically, will hide the thank you message
  // resetForm(null,false) // reset the form so someone else can take it / re-take the survey
}

let dispatchUpdate = async () => {
  await tick()
  // console.log('[dispatch::update]',formData, get(form))
  dispatch('update', {state: get(form), formData, store: form})
}

let dispatchNextpage = async () => {
  await tick()
  dispatch('nextPage', {state: get(form), formData, store: $form})
}

let dispatchPrevpage = async () => {
  await tick()
  dispatch('prevPage', {state: get(form), formData, store: $form})
}

let dispatchReset = async () => {
  dispatch('reset', {...get(form)})
  await tick()
}


const validatePage = async (page) => {
  // validate the page's fields
  let pageErrors = false
  hasPageErrors==false
  let validations = page.fields.map(async f => {
    await validateField(f.id || f.name)
    if($touched[f.name] && $errors[f.name].length>0)
      pageErrors=true
  })
  await Promise.all(validations)

  if(pageErrors==false) hasPageErrors = false 
  // if(pageErrors==false) hasPageErrors = false 
  else hasPageErrors = true

  // console.log('validatePage:', pageErrors, hasPageErrors, $errors)
  return hasPageErrors
}

const validateAllPages = async () => {
  let validatePages = formPages.map(async page => {
    await validatePage(page)
  })
  await Promise.all(validatePages)
  // console.log('validateAllPages:', hasPageErrors)
  return hasPageErrors
}
 

export let gotoNextPage = async (page,p) => {

  await validatePage(page)

  if(hasPageErrors==true)
    return

  if(!hasPageErrors && curPageNumber < formPages.length -1) {
    curPageNumber++
    await tick()
    dispatchNextpage()
    if(process.browser)
      window.history.pushState(`page ${curPageNumber+1}`, `page ${curPageNumber+1}`, `${window.location.href.split('?')[0]}?page=${curPageNumber+1}`)
  
    zzz(scrollToAnchor, 'formlet-top', 200)
  }
}

export let gotoPrevPage = async (page,p) => {
  if(curPageNumber > 0){
    curPageNumber--
    await tick()
    dispatchPrevpage()
    if(process.browser) window.history.pushState(`page ${curPageNumber+1}`, `page ${curPageNumber+1}`, `${window.location.href.split('?')[0]}?page=${curPageNumber+1}`)
  
    zzz(scrollToAnchor, 'formlet-top', 200)
    
  }
}

export const resetForm = async (evt, showConfirm=true) => {
  let doReset
  
  if(showConfirm) {
    doReset = window.confirm((formData.settings && formData.settings.resetText) || 'Are you sure you want to reset the form?')
    if(!doReset)
      return
  }
  
  dispatchReset()
  isReset=true // set a reset state to prevent initialVal
  if(evt)
    evt.preventDefault()

  // console.log('[formletpaged] form reset', formData.yup.initialValues)
  form.set({form: undefined})
  formStore.set({form: formData.yup.initialValues}) // reset the store / localstorage
  curPageNumber = 0
  furthestPageNumber = 0
  submitted = false
  isSubmitting = false
  if(process.browser) window.history.pushState(`page 1`, `page 1`, `${window.location.href.split('?')[0]}?page=1`)
  handleReset()
  zzz(scrollToAnchor, 'formlet-top', 200)
}

const resetReset = async () => { // reset the reset mode
  await tick()
  isReset=false
}

</script>


<style type="text/scss">

  .Formlet-page-TOC-list {
    list-style-type: none;
  }
  .Formlet-page-TOC-item {
    position: relative;
    &:before { 
      content: '⬡ ';
    }
  }
    .__complete {
      color: #128425;
      &:before { 
        content: '✔︎ ';
      }
    }
    .__current {
      color: #1A7CFF;
      &:before { 
        content: '⬢ ';
        position: relative;
        top: -2px;
      }
    }

</style>



