
<!-- temp hide anything not open -->
{#if schedule.fields['Status'] && schedule.fields['Status'].includes('Open') }

<div class="SpeakerSignup _card _padding _margin-top-2 _divider-bottom">

	<div class="SpeakerSignup-body _padding" >
	  <div class="SpeakerSignup-header">
	  	<div>
	  		<span class="_tag" class:open={ schedule.fields['Status'] == 'Open' }>{ schedule.fields['Status'] }</span>
	  	</div>
	  	<h3>{ schedule.fields['Name'] } </h3>

	  	{#if schedule.fields['Description']}
    		{@html marked(schedule.fields['Description'])}
	  	{/if}

	  </div>


	  {#if schedule.fields['Status'] == 'Open'}
  		<form class="Formlet _padding-top-2" on:submit={handleSubmit}>
				<div class="_grid-2">
					<div class="Formlet Formlet-input _form-control _divider-bottom">
						<label for="name" class="_form-label">Your name</label>
						<input id="name" name="name" on:change={handleChange} on:blur={handleChange} bind:value={$form.Name} placeholder="e.g. Jane H. Doe" required="required" type="text" class="_form-input __width-full"> 
					</div>

					<div class="Formlet Formlet-input _form-control _divider-bottom">
						<label for="email" class="_form-label">Your email</label>
						<input id="email" name="email" on:change={handleChange} on:blur={handleChange} bind:value={$form.Email}  placeholder="jane@phage.directory" required="required" type="email" class="_form-input __width-full"> 
					</div>
				</div>

				<div class="Formlet Formlet-input _padding-top _form-control _divider-bottom">
					<label for="topic" class="_form-label">Your presentation topic</label>
					<input id="topic" name="topic" on:change={handleChange} on:blur={handleChange} bind:value={$form.Topic}  placeholder="e.g. Phage manufacturing methods" required="required" type="text" class="_form-input __width-full"> 
				</div>

				<div class="_grid-2">
					<div>
						{#if registered}
							<div class="_padding-top">You're all signed up!</div>
						{/if}
					</div>
					<div class="_right">
						<input type="submit" value="Sign Up" class="_button __action  _margin-bottom-none" > 
					</div>
				</div>
				{#each Object.keys($errors) as error}
          {#if $errors[error]}
            <div class="_padding-top">{$errors[error]}</div>
          {/if}
        {/each}
			</form>

	  {:else if schedule.fields['Status'] == 'Awaiting Approval'}
	  	<!-- don't show much -->
	  {:else}
	  	<div> { schedule.fields['Name'] } / { schedule.fields['Topic'] } / { schedule.fields['Description'] }
	  	</div>
	  {/if}

		
	</div>

</div>


{/if}

<script>
	export let schedule
	import marked from 'marked'

  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";



	let registered


  yup.setLocale({
    string: {
      // email: 'EMAIL ERROR!!!'
    }
  })

  const { form, errors, state, handleChange, handleSubmit, touched } = createForm({
    initialValues: {
      Name: undefined,
      Email: undefined,
      Topic: undefined
    },
    validationSchema: yup.object().shape({
      Name: yup
        .string()
        .required(),
      Email: yup
        .string()
      	.email()
        .required(),
      Topic: yup
        .string()
        .required(),
    }),
    onSubmit: async (_data) => {

    	// console.log('sub data:', _data)
    	const data = {
			type: 'speaker',
			name: _data.Name,
			topic: _data.Topic,
			email: _data.Email,
			schedule,
		}

		const reg = fetch(
			`/api/getters`, {
			headers: {
	      'Content-Type': 'application/json'
	    },
  		method: 'POST',
  		body: JSON.stringify(data)
  	}).then((res) => {
  		console.log('reg finished: ', res)
  		if(res.status == 200) {
  			registered = true
  			email = ''
  			name = ''
  			topic = ''
  		}
  	});
    }
  });


</script>





