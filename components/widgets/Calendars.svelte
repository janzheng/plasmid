
<div class="Calendars {classes}">
  <div class="{headerClasses}">{header}</div>

  {#if iCalLink}
    <div class="{itemClasses}"><a class="" target="_blank" href="{iCalLink}">iCal (Apple / Outlook)</a></div>
  {/if}
  {#if googleLink}
    <div class="{itemClasses}"><a class="" target="_blank" href="{googleLink}">Google Calendar</a></div>
  {/if}
  {#if yahooLink}
    <div class="{itemClasses}"><a class="" target="_blank" href="{yahooLink}">Yahoo</a></div>
  {/if}
  {#if outlookLink}}
    <div class="{itemClasses}"><a class="" target="_blank" href="{outlookLink}">Outlook</a></div>
  {/if}
</div>

<script>
  import { onMount } from 'svelte';

  export let classes="mt-2", header="Add to your calendar";
  export let itemClasses ="text-sm", headerClasses="";

  // allow overrides, e.g. if an iCal and Google has been setup, can override this
  export let iCalLink, googleLink, outlookLink, yahooLink;

  onMount(async () => {
    if(iCalLink || googleLink || outlookLink || yahooLink) return;
    // don't do a fetch if we already have the links, since they'll be wrong (probably)


    const res = await fetch(
      `/api/event?links=true`, {
      method: 'GET',
    })
    if(res.ok) {
      let json = await res.json()
      googleLink = json['googleLink']
      outlookLink = json['outlookLink']
      yahooLink = json['yahooLink']
    }
  });

</script>

