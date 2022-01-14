
<script>

	export let email, socialProfiles

	socialProfiles = socialProfiles // reactive

	let socials
	$: socials = Array.from(socialProfiles)

	$: socials.map(social => {
		if(social.type == 'twitter')
			social.username = '@'+social.username
		// if(social.type == 'linkedin')
		// 	social.username = 'linkedin/in/'+social.username
		if(social.type == 'google-scholar') {
			social.username = 'Google Scholar'
		}

		if(social.type == 'github') {
			social.type = 'github-circled' // for icon to work
		}
	})
</script>


<div class="SocialBox">


	{#if email}
		<div class="Email">
			<i class="_font-phage icon-mail"/>
			<a href={`mailto:${email}`} alt={email}>{ email }</a></div>
	{/if}

	{#each socials as social}
		<!-- social: {{ JSON.stringify(social) }} -->
		<div class={social.type}>
			<i class={`_font-phage icon-${social.type}`}/>
			<a href={social.url} alt={social.type}>{ social.username }</a> <!-- {social.type} -->
		</div>
	{/each}

</div>


<style type="text/scss">

	a {
		text-decoration: none;
	}
</style>