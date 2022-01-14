

<div class="Unsubscribe _margin-top _margin-bottom">

  <form class="Formlet _padding-top" on:submit={handleSubmit}>
    <div class="">
      <div class="Formlet Formlet-input _form-control _divider-bottom">
        <label for="email" class="_form-label">Email</label>
        <input id="email" name="email" on:change={handleChange} required="required"  on:blur={handleChange} bind:value={$form.email} placeholder="Jane Doe" type="text" class="_form-input __width-full"> 
      </div>
    </div>

    <div class="">
      {#if submitted}
        <div class="_card _padding"><div class="_color-brand _padding-top-0">You have successfully unsubscribed!</div></div>
      {:else}
        <div class="_right">
          <button type="submit" class="_button __action _margin-bottom-none _width-full" >
            {#if isSubmitting}
              <div class="_relative "><span class="_loader __circle _margin-right-2"></span> <span class="_margin-left-2">Unsubscribing...</span></div>
            {:else}
              Unsubscribe
            {/if}
          </button> 
        </div>
      {/if}
    </div>
    {#each Object.keys($errors) as error}
      {#if $errors[error]}
        <div class="_error _margin-top _padding-top">{$errors[error]}</div>
      {/if}
    {/each}
  </form>

</div>


<script>
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { getContext } from 'svelte';

  export let email

  let submitted, exists, isSubmitting = false
  const Content$ = getContext('Content')
  $: Content = $Content$

  yup.setLocale({
    string: {
    }
  })

  const { form, errors, state, handleChange, handleSubmit, touched } = createForm({
    initialValues: {
      email: email,
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .required('Email is required')
        .email('Email must be valid'),
    }),
    onSubmit: async (_data) => {

      isSubmitting = true
      exists = false
      submitted = false 

      const data = {
        type: 'unsubscribe',
        email: _data.email,
      }

      const reg = fetch(
        `/api/setters`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
      }).then( async (res) => {
        isSubmitting = false

        // don't take care of error state; every email shows as "unsubscribed" to prevent skimming
        // console.log('reg finished: ', text)
        if(res.status == 200) {
          submitted = true
        }
      });
    }
  });

</script>





<style type="text/scss">

  :global(h3 > p) {
    font-size: 1.3rem;
  }

</style>