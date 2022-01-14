
<div class="Calendars {classes}">
  <div class="_font-small">{header}</div>
  <div class=""><a class="_font-small" target="_blank" href="{iCalLink}">iCal (Apple / Outlook)</a></div>
  <div class=""><a class="_font-small" target="_blank" href="{googleLink}">Google Calendar</a></div>
  <div class=""><a class="_font-small" target="_blank" href="{yahooLink}">Yahoo</a></div>
  <div class=""><a class="_font-small" target="_blank" href="{outlookLink}">Outlook</a></div>
</div>

<script>
  import { onMount } from 'svelte';

  export let classes="_margin-top-2", header="Add to your calendar"
  let iCalLink = '/api/event'
  let googleLink, outlookLink, yahooLink

  onMount(async () => {
    // load payment key on site load — speeds things up
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
  })

</script>