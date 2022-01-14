
{#if profileStyle==="Inline"}
	<div class="RenderProfile __inline _card _padding _margin-bottom-none-i">
		<div class="_flex">
			<div class="">
				{#if profile && profile.fields['URL']}
					<a href={profile.fields['URL']}><img class="_v-middle" alt={`${profile.fields['Name']} Profile Image`} src={profile.fields['Attachments'][0]['url']}></a>
					<!-- <div><a href={profile.fields['URL']}>{@html marked(profile.fields['Name'] || '')}</a></div> -->
				{:else}
					{#if profile.fields['Attachments'] && profile.fields['Attachments'][0]}
						<img class="_v-middle" alt={`${profile.fields['Name']} Profile Image`} src={profile.fields['Attachments'][0]['url']}>
						<!-- <div>{@html marked(profile.fields['Name'] || '')}</div> -->
					{:else}
						<span></span>
					{/if}
				{/if}
			</div>
			<div class="_flex-1 _margin-left-half _flex-col _flex-horizontally">
				{#if profile.fields['URL']} 
					<div class="RenderProfile-name"><a href={profile.fields['URL']}>{@html marked(profile.fields['Name'] || '')}</a></div>
					<div class="RenderProfile-desc _md-pfix">{@html marked(profile.fields['Short'] || '')}</div>
				{:else} 
					<div class="RenderProfile-name">{@html marked(profile.fields['Name'] || '')}</div>
					<div class="RenderProfile-desc _md-pfix">{@html marked(profile.fields['Short'] || '')}</div>
				{/if}
			</div>
		</div>
	</div>

{:else if profileStyle==="Full"}
	<div class="RenderProfile _card _padding _margin-bottom-none-i ">
		<div class={profile.fields['Attachments'] ? "_grid-1-6-xs" : ""}>
			<div class="">
				{#if profile.fields['URL']}
					<a href={profile.fields['URL']}><img class="_v-middle" alt={`${profile.fields['Name']} Profile Image`} src={profile.fields['Attachments'][0]['url']}></a>
					<!-- <div><a href={profile.fields['URL']}>{@html marked(profile.fields['Name'] || '')}</a></div> -->
				{:else}
					<img class="_v-middle" alt={`${profile.fields['Name']} Profile Image`} src={profile.fields['Attachments'][0]['url']}>
					<!-- <div>{@html marked(profile.fields['Name'] || '')}</div> -->
				{/if}
			</div>
			<div class="_flex-col">
				{#if profile.fields['URL']} 
					<div class="RenderProfile-name"><a href={profile.fields['URL']}>{@html marked(profile.fields['Name'] || '')}</a></div>
					<div class="RenderProfile-desc _md-pfix">{@html marked(profile.fields['Short'] || '')}</div>
				{:else} 
					<div class="RenderProfile-name">{@html marked(profile.fields['Name'] || '')}</div>
					<div class="RenderProfile-desc _md-pfix">{@html marked(profile.fields['Short'] || '')}</div>
				{/if}
			</div>
		</div>
		<div class="RenderProfile-description _margin-top-2">
			{@html marked(profile.fields['Content'] || profile.fields['Markdown'] || '')}
		</div>
	</div>


{:else}
	<div class="RenderProfile _card _padding _margin-bottom-none-i _center">
		<div class="RenderProfile-wrapper">
			{#if profile.fields['URL']}
				<a href={profile.fields['URL']}><img alt={`${profile.fields['Name']} Profile Image`} src={profile.fields['Attachments'][0]['url']}></a>
				<div class="RenderProfile-name"><a class="_md-pfix" href={profile.fields['URL']}>{@html marked(profile.fields['Name'] || '')}</a></div>
			{:else}
				<img alt={`${profile.fields['Name']} Profile Image`} src={profile.fields['Attachments'][0]['url']}>
				<div class="_md-pfix">{@html marked(profile.fields['Name'] || '')}</div>
			{/if}
		</div>
		<div class="RenderProfile-desc _md-pfix">{@html marked(profile.fields['Short'] || '')}</div>
	</div>
{/if}



<script>
	export let profile, profileStyle="Inline"
	import marked from 'marked'

</script>





<style type="text/scss">

	img {
		// max-width: 100%;
		min-width: 80px;
		min-height: 80px;
		max-width: 80px;
		max-height: 80px;
		border-radius: 100%;
		object-fit: cover;
		// margin-bottom: 1rem;
	}

	.RenderProfile-name {
		margin-bottom: 1rem;
	}	

	:global(.RenderProfile-name *) {
		font-weight: bold;
	}

	:global(.RenderProfile-name p) {
		margin-bottom: 0;
	}

	:global(.RenderProfile *) {
		line-height: 1.4rem !important;
	}
	// .RenderProfile-wrapper, .RenderProfile-desc {
	// 	text-align: center;
	// }

	.__inline {

	}

</style>


