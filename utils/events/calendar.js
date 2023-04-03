
// gets a proxy event calendar run by Jessica's volunteers
// the proxy is a Cloudflare worker that adds CORS headers

import fetch from "node-fetch"
import ical from 'ical'

export const getCalendarEvents = async (calUrl = `https://calendar.google.com/calendar/ical/jp5a7kvi83ilbcd0f7e6amk6ks%40group.calendar.google.com/public/basic.ics`) => {
  try {
    let res = await fetch(`https://cf-proxy.yawnxyz.workers.dev/corsproxy/${calUrl}`)

    if (res.ok) {
      let text = await res.text()
      return ical.parseICS(text);
    } else {
      return false
    }
  } catch (e) {
    console.error('[getCalendarEvents] error', e)
  }
}

// returns a list of iCal events:

/* 


<div class="_content mx-auto">
  {#each Object.values(events) as event}
    {#if event.start}
      <div class="Card-light mb-4">
        <p>Summary: {@html event.summary}</p>
        <p>Description: {@html event.description}</p>
        <p>Start Date: {event.start?.toISOString()}</p>
      </div>
    {/if}
  {/each}
</div>


*/


// this gets calendar text, which can be attached to nodemailer
export const getCalendar = async (calUrl =`https://calendar.google.com/calendar/ical/jp5a7kvi83ilbcd0f7e6amk6ks%40group.calendar.google.com/public/basic.ics`) => {

  try {
    let res = await fetch(`https://cf-proxy.yawnxyz.workers.dev/corsproxy/?apiurl=${calUrl}`)
    if (res.ok) {
      return res.text()
    } else {
      return false
    }

  } catch (e) {
    console.error('[getCalendar] error', e)
  }
}

// set GET equals to this in Sveltekit, e.g. in utility/api/calendar
// example that gets the PD calendar
export const getCalendarEndpoint = async () => {
  try {
    let text = await getCalendar()
    return new Response(text, {
      headers: {
        'content-type': 'text/calendar'
      }
    })
  } catch (err) {
    console.error('[api/calendar/GET]', err)
  }
}
