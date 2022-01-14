

<div class="ScheduleSignup ">
  <h3 class="">Sign Up for this Event</h3>

  <!-- <p># of phage enthusiasts signed up so far: { signupCounter }</p> -->
  <p>Details for individual events will be sent out right before the event starts.</p>
  
  <form class="Formlet _padding-top" on:submit={handleSubmit}>
    <div class="_grid-2">
      <div class="Formlet Formlet-input _form-control _divider-bottom">
        <label for="name" class="_form-label">Your name</label>
        <input id="name" name="name" on:change={handleChange} on:blur={handleChange} bind:value={$form.Name} placeholder="e.g. Jane H. Doe" required="required" type="text" class="_form-input __width-full"> 
      </div>

      <div class="Formlet Formlet-input _form-control _divider-bottom">
        <label for=email class="_form-label">Your email</label>
        <input id="email" name="email" on:change={handleChange} on:blur={handleChange} bind:value={$form.Email}  placeholder="jane@phage.directory" required="required" type="email" class="_form-input __width-full"> 
      </div>
    </div>

    <div class="_grid-2 _align-vertically">
      <div>
        {#if exists}
          <div class="">You've already signed up for this event!</div>
        {/if}
        {#if registered}
          <div class="">You're all signed up!</div>
        {/if}
      </div>
      <div class="_right">
        <button type="submit" class="_button __action _margin-bottom-none" >
          {#if isSubmitting}
            <div class="_relative "><span class="_loader __circle _margin-right-2"></span> <span class="_margin-left-2">Signing up...</span></div>
          {:else}
            Sign Up for this Event
          {/if}
        </button> 
      </div>
    </div>
    {#each Object.keys($errors) as error}
      {#if $errors[error]}
        <div class="_padding-top">{$errors[error]}</div>
      {/if}
    {/each}
  </form>
</div>


<script>
  export let item
  import marked from 'marked'

  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";

  import { getContext } from 'svelte';


  let registered, exists, isSubmitting = false
  const Profiles$ = getContext('Profiles')
  $: Profiles = $Profiles$

  let signupCounter
  $: signupCounter = item.fields['Attendees'] ? item.fields['Attendees'].length : 0

  yup.setLocale({
    string: {
      // email: 'EMAIL ERROR!!!'
    }
  })

  const { form, errors, state, handleChange, handleSubmit, touched } = createForm({
    initialValues: {
      Name: undefined,
      Email: undefined,
    },
    validationSchema: yup.object().shape({
      Name: yup
        .string()
        .required(),
      Email: yup
        .string()
        .email()
        .required(),
    }),
    onSubmit: async (_data) => {

      isSubmitting = true
      exists = false
      registered = false 

      // console.log('sub data:', _data)
      const data = {
        type: 'session',
        name: _data.Name,
        email: _data.Email,
        session: item,
      }

      const reg = fetch(
        `/api/getters`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
      }).then(async (res) => {
        isSubmitting = false
        const text = await res.text()
        // console.log('reg finished: ', text)
        if(text === 'exists') {
          exists = true
        } else if(res.status == 200) {
          registered = true
        }
      });
    }
  });

</script>





<style type="text/scss">

  :global(h3 > p) {
    font-size: 1.3rem;
  }

  .ScheduleSignup {
    padding: 0 1rem;
    padding-bottom: 1rem;
    background: #eef5fb;
    margin-bottom: 1rem;
  }

</style>

