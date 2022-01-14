
<div class="ScheduleItem _card _padding">
	{#if item.fields['Attachments'] && item.fields['Attachments'][0]}
		<div class="ScheduleItem-cover">
			<img class="ScheduleItem-cover-image" src={item.fields['Attachments'][0]['url']} alt="Item cover image">
		</div>
	{/if}

	<h2 class="ScheduleItem-topic _md-pfix"><a href={`/schedule/${item.fields['Slug']}`}>{@html marked(item.fields['Topic'] || '')}</a></h2>


	{#if showDate}
		<div class="ScheduleItem-date"><strong>Date:</strong> <span class="_md-pfix">{@html marked(item.fields['Presentation Date'] ||'')}</span></div>
	{/if}

	{#if showDescription}
		<div class="_margin-bottom-2">{@html marked(item.fields['Description'] || '')}</div>
	{/if}

	{#if showShortDescription}
		<div class="ScheduleItem-short">{@html marked(item.fields['Description'] || '')}</div>
	{/if}


	{#if showPostEvent && item.fields['PostEvent']}
		<div class="_padding _card _pd-bg-color-ltgray">{@html marked(item.fields['PostEvent'] || '')}</div>
	{/if}

	{#if showSignup}
		<ScheduleSignup {item} />
	{/if}

	<div class="_margin-center">
	  {#if item.fields['Speakers'] && item.fields['Speakers'].length > 0}
  		<!-- <h3>Speakers</h3> -->
	    <!-- <div class="_grid-2"> -->
    	<div class={showDynamicProfiles && getGridClass(item.fields['Speakers'].length)}>
	      {#each speakers as profile}
	        <RenderProfile {profile} profileStyle={profileStyle}></RenderProfile>
	      {/each}
	    </div>
	  {/if}

	  {#if item.fields['Chairs'] && item.fields['Chairs'].length > 0}
  		<h3 class="_margin-top-2">Chairs</h3>
	    <!-- <div class="_grid-2"> -->
	    <div class={showDynamicProfiles && getGridClass(item.fields['Chairs'].length)}>
	      {#each chairs as profile}
	        <RenderProfile {profile} profileStyle={profileStyle}></RenderProfile>
	      {/each}
	    </div>
	  {/if}
	</div>

</div>


<script>
	export let item, 
		showSignup=false, 
		profileStyle='Inline', 
		showPostEvent=false, 
		showDescription=false, 
		showShortDescription=false,
		showDate=true,
		showDynamicProfiles=true

	import marked from 'marked'
  import RenderProfile from '../components/RenderProfile.svelte'
  import ScheduleSignup from '../components/ScheduleSignup.svelte'
  import { getContext } from 'svelte';

  const Profiles$ = getContext('Profiles')
  $: Profiles = $Profiles$
  let speakers = [], chairs = []

  // $: console.log('upcoming item', Profiles)

  $: if(Profiles && item.fields['Speakers'] && item.fields['Speakers'].length>0) {
  	item.fields['Speakers'].map(speaker => {
  		speakers = [...speakers , Profiles.filter(profile => profile.id == speaker)[0]]
  		speakers = [...new Set(speakers)] // dedup using set
  	})
  }

  $: if(Profiles && item.fields['Chairs'] && item.fields['Chairs'].length>0) {
  	item.fields['Chairs'].map(chair => {
  		chairs = [...chairs , Profiles.filter(profile => profile.id == chair)[0]]
  		chairs = [...new Set(chairs)] // dedup using set
  	})
  }



  // the grid class depends on # of items
  const getGridClass = (items) => {
  	if (items > 3)
  		return `_grid-2` // grid-2 looks generally better

  	if (items < 1)
  		return ``

  	return `_grid-${items}-md`
  }

</script>



<style type="text/scss">

	:global(h3 > p) {
		font-size: 1.3rem;
	}

	:global(h3 a p) {
		font-size: 21px;
		line-height: 27.93px;
	}

	.ScheduleItem-date {
		strong {
			padding-right: 1rem;
		}
	}
		:global(.ScheduleItem-date *) {
			// font-size: 1.2rem;
	    // line-height: 1.7rem;
	    // font-weight: 700;
	    padding: 18px 0;
			vertical-align: middle;
		}


	:global(.ScheduleItem-topic *) {
		padding-top: 0;
		font-size: 1.4rem;
	}

	.ScheduleItem-cover-image {
		max-width: 100%;
		object-fit: contain;
	}

	:global(._md-pfix p) {
		display: inline-block;
	}

	.ScheduleItem-short {
		max-height: 6rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	
</style>


