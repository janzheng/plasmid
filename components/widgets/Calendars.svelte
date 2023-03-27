
<div class="Calendars {classes}">
  <div class="{itemClasses}">{header}</div>
  <div class="{itemClasses}"><a class="" target="_blank" href="{iCalLink}">iCal (Apple / Outlook)</a></div>
  <div class="{itemClasses}"><a class="" target="_blank" href="{googleLink}">Google Calendar</a></div>
  <div class="{itemClasses}"><a class="" target="_blank" href="{yahooLink}">Yahoo</a></div>
  <div class="{itemClasses}"><a class="" target="_blank" href="{outlookLink}">Outlook</a></div>
</div>

<script>
  import { onMount } from 'svelte';

  export let classes="mt-2", header="Add to your calendar";
  export let itemClasses ="text-sm";
  export let iCalLink = '/api/event';
  export let googleLink, outlookLink, yahooLink;

  onMount(async () => {
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