
<div class="Question">
  <form class="Formlet" on:submit={handleSubmit}>

    {#if !isSubmitting}
      {#if !$Profile.ticketnumber && showEmail && !loadingTicket}
        <div class="Formlet Formlet-input _margin-bottom">
          <!-- <label for=email class="_form-label _inline">Email</label> (optional) -->
          <input id="email" name="email" on:change={handleChange} on:blur={handleChange} bind:value={$form.email}  placeholder="Your email (optional)" type="email" class="_form-input __width-full"> 
        </div>
      {/if}
      {#if showTopic}
        <div class="Formlet Formlet-input _margin-bottom">
          <!-- <label for="comment" class="_form-label">Comment</label> -->
          <input id="topic" name="topic" bind:value={$form.topic} required="required" class="_form-input __width-full" placeholder="Topic, Session, or Speaker name">
        </div>
      {/if}
      <div class="Formlet Formlet-input _margin-bottom">
        <!-- <label for="comment" class="_form-label">Comment</label> -->
        <input id="comment" name="comment" bind:value={$form.comment} required="required" class="_form-input __width-full" placeholder="Question">
      </div>
    {/if}

    <button type="submit" class="_button __action _margin-bottom-none _width-full" >
      {#if isSubmitting}
        <div class="_relative "><span class="_loader __circle _margin-right-2"></span> <span class="_margin-left-2">Sending...</span></div>
      {:else}
        {CTA}
      {/if}
    </button> 
    {#if submitted}
      <div class="_card _padding _margin-top"><div class="_color-brand _padding-top-0">🎉 &nbsp; Thank you!</div></div>
    {/if}
  </form>

</div>


<script>
  import { Profile, checkUser } from "@/stores/profile"

  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { getContext } from 'svelte';

  export let name, email, topic, type, showEmail=true, showTopic=false

  let submitted, exists, isSubmitting = false, loadingTicket=true, CTA = 'Ask a Question'
  const Content$ = getContext('Content')
  $: Content = $Content$

  checkUser()

  $: if(!Profile && $Profile.ticketnumber) {
    loadingTicket = false
  }


  yup.setLocale({
    string: {
    }
  })

  const { form, errors, state, handleChange, handleSubmit, touched } = createForm({
    initialValues: {
      name: name,
      email: email,
      topic: topic,
      comment: undefined,
    },
    validationSchema: yup.object().shape({
      name: yup
        .string(),
      email: yup
        .string()
        .email('Email must be valid'),
      comment: yup
        .string()
        .required('Question required'),
      topic: yup
        .string()
    }),
    onSubmit: async (_data) => {

      if(isSubmitting)
        return

      isSubmitting = true
      exists = false
      submitted = false 
      
      await checkUser() // sync user if exists

      const data = {
        type: 'question',
        name: _data.name,
        email: _data.email,
        comment: _data.comment,
        topic: _data.topic || topic,
        questiontype: type,
        recordId: $Profile ? $Profile.recordId : null
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
        const text = await res.text()
        // console.log('reg finished: ', text)
        if(res.status == 200) {
          submitted = true
          $form.name = ''
          $form.email = ''
          $form.topic = ''
          $form.comment = ''
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