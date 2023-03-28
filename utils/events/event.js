
// 3/26/23 — adapted to Sveltekit
// this ONLY gets ical of the event! You need server-side to serve the file. The other ones are generated as URLs

import { json } from '@sveltejs/kit';
import { cytosis, getContent } from "$plasmid/utils/airfetch.js"


// set as export const GET = _GET
export const _GET = async ({ url }) => {
  let links = url.searchParams.get('links')
  let fileName = url.searchParams.get('fileName')

  let evt = await getEvent(links, fileName)
  // console.log('api/event:', evt)
  return evt
}


// wraps around a sveltekit response
export async function getEvent(getLinks, fileName='event') {
  try {
    let event = await getEventFromContent()

    if (getLinks) {
      return json({
        googleLink: google(event),
        yahooLink: yahoo(event),
        officeLink: office365(event),
        outlook: outlook(event),
      })
    } else {
      return new Response(decodeURIComponent(customIcs(event).split("charset=utf8,")[1]), {
        headers: {
          'Content-Type': 'text/calendar; charset=utf8',
          'Content-Disposition': `attachment; filename="${fileName}.ics"`,
        }
      })
    }
  } catch (err) {
    console.error('[ics] api/get error:', err)
    throw new Error('[ics] Error', err)
  }
}









// get event from custom Airtable (look @ Evergreen example)
export async function getEventFromContent(content) {

  if(!content) {
    const _results = await getContent()
    content = _results['Content']
  }

  /*
   event = {
      title: 'Evergreen 2021',
      start: '2023-08-02T16:00:00.000Z',
      end: '2023-08-05T22:00:00.000Z',
      alarm: '-PT15M',
      description: "Please visit Evergreen's website for the full schedule, at https://evergreen.phage.directory",
      duration: [ '1', 'hour' ],
      url: 'https://us02web.zoom.us/j/85928198614?pwd=WFlPODNLVDVKbXBCMWxyTnNLQ3VkUT09',
      location: 'https://evergreen.phage.directory',
      organizer: 'ORGANIZER;CN=Evergreen:mailto:evergreen@phage.directory',
      allDay: false
    }

    ICS file of event with 15 minute alarm:
      BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      URL:https://us02web.zoom.us/j/85928198614?pwd=WFlPODNLVDVKbXBCMWxyTnNLQ3VkUT09
      DTSTART:20220929T160000Z
      DTEND:20220929T220000Z
      SUMMARY:Evergreen 2021
      DESCRIPTION:Please visit Evergreen's website for the full schedule, at https://evergreen.phage.directory
      LOCATION:https://evergreen.phage.directory
      ORGANIZER;CN=Evergreen:mailto:evergreen@phage.directory
      BEGIN:VALARM
      ACTION:DISPLAY
      DESCRIPTION:Please visit Evergreen's website for the full schedule, at https://evergreen.phage.directory
      TRIGGER:-PT15M
      END:VALARM
      END:VEVENT
      END:VCALENDAR
  */

  let event = {
    title: cytosis.findField('_eventName', content, 'Markdown'),
    start: cytosis.findField('_datetime', content, 'DateTime GMT'),
    end: cytosis.findField('_datetime', content, 'DateTimeEnd GMT'),
    alarm: cytosis.findField('_datetime', content, 'Alarm Trigger'),
    description: cytosis.findField('_eventDescription', content, 'Markdown'),
    // tzid: cytosis.findField('_dateTime', content, 'Timezone'),
    duration: cytosis.findField('_eventDuration', content, 'Markdown').split(','),
    url: cytosis.findField('_eventUrl', content, 'Markdown') || cytosis.findField('_url', content, 'Markdown'),
    location: cytosis.findField('_eventLocation', content, 'Markdown'),
    organizer: cytosis.findField('_eventOrganizer', content, 'Markdown'),
    allDay: cytosis.findField('_allDay', content, 'Markdown') === 'true',
  }

  return event
}

export async function getIcsFromEvent(event) {
  if (!event) event = await getEventFromContent()
  return customIcs(event)
}

export async function getIcsDecodedFromEvent(event) {
  if (!event) await getEventFromContent()
  return decodeURIComponent(customIcs(event).split("charset=utf8,")[1])
}



export async function getEventLinks(event) {
  if (!event) {
    event = await getEventFromContent()
  }

  try {
    return {
      google: google(event),
      yahoo: yahoo(event),
      office: office365(event),
      outlook: outlook(event),
      ics: ics(event),
    };
  } catch (err) {
    console.error('[ics] error:', err)
    throw new Error('[ics] Error', err)
  }
}




// export async function sapperGetEndpoint(req, res) {
//   try {
//     let event = await getEvent()

//     if (req.query.links) {
//       sendData({
//         googleLink(event),
//         yahooLink(event),
//         officeLink: office365(event),
//         outlook(event),
//       }, res);
//     } else {
//       send(res, 200, decodeURIComponent(customIcs(event).split("charset=utf8,")[1]), {
//         'Content-Type': 'text/calendar',
//         // 'Content-Type': 'text',
//       })
//     }
//   } catch (err) {
//     console.error('[ics] api/get error:', err)
//     throw new Error('[ics] Error', err)
//   }
// }









export const customIcs = (calendarEvent) => {
  const event = eventify(calendarEvent);
  const formattedDescription = (event.description || "")
    .replace(/,/gm, ",")
    .replace(/;/gm, ";")
    .replace(/\n/gm, "\\n")
    .replace(/(\\n)[\s\t]+/gm, "\\n");

  const formattedLocation = (event.location || "")
    .replace(/,/gm, ",")
    .replace(/;/gm, ";")
    .replace(/\n/gm, "\\n")
    .replace(/(\\n)[\s\t]+/gm, "\\n");

  const { start, end, alarmUtc } = formatTimes(event, "dateTimeUTC");
  const calendarChunks = [
    {
      key: "BEGIN",
      value: "VCALENDAR",
    },
    {
      key: "VERSION",
      value: "2.0",
    },
    {
      key: "BEGIN",
      value: "VEVENT",
    },
    {
      key: "URL",
      value: event.url,
    },
    {
      key: "DTSTART",
      value: start,
    },
    {
      key: "DTEND",
      value: end,
    },
    {
      key: "SUMMARY",
      value: event.title,
    },
    {
      key: "DESCRIPTION",
      value: formattedDescription,
    },
    {
      key: "LOCATION",
      value: formattedLocation,
    },

    // Custom
    {
      // ORGANIZER:CN:Evergreen:mailto:evergreen@phage.directory
      string: event.organizer
      // key: "ORGANIZER",
      // value: event.organizer,
    },

    // alarm notifications
    {
      key: "BEGIN",
      value: "VALARM",
    },
    {
      key: "ACTION",
      value: "DISPLAY",
    },
    {
      key: "DESCRIPTION",
      value: formattedDescription,
    },
    {
      key: "TRIGGER",
      value: event.alarm,
    },
    {
      key: "END",
      value: "VALARM",
    },


    {
      key: "END",
      value: "VEVENT",
    },
    {
      key: "END",
      value: "VCALENDAR",
    },
  ]

  let calendarUrl = "";

  calendarChunks.forEach((chunk) => {
    if (chunk.string)
      calendarUrl += `${chunk.string}\n`;
    else if (chunk.value) {
      calendarUrl += `${chunk.key}:${encodeURIComponent(`${chunk.value}\n`)}`;
    }
  });


  return `data:text/calendar;charset=utf8,${calendarUrl}`;
};





// embedding calendar-link here b/c of UMD/ES6 issues


const TimeFormats = {
  dateTimeWithOffset: "YYYY-MM-DD[T]HH:mm:ssZ",
  dateTimeUTC: "YYYYMMDD[T]HHmmss[Z]",
  allDay: "YYYYMMDD",
};
function formatTimes({ allDay, startUtc, endUtc, alarmUtc }, dateTimeFormat) {
  const format = TimeFormats[allDay ? "allDay" : dateTimeFormat];
  return { start: startUtc.format(format), end: endUtc.format(format) };
}




import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { stringify } from "query-string";

dayjs.extend(utc);

export const eventify = (event) => {
  const { start, end, duration, ...rest } = event;
  const startUtc = dayjs(start).utc();
  const endUtc = end
    ? dayjs(end).utc()
    : (() => {
      if (event.allDay) {
        return startUtc.add(1, "day");
      }
      if (duration && duration.length == 2) {
        const value = Number(duration[0]);
        const unit = duration[1];
        return startUtc.add(value, unit);
      }
      return dayjs().utc();
    })();
  return {
    ...rest,
    startUtc,
    endUtc,
  };
};

export const google = (calendarEvent) => {
  const event = eventify(calendarEvent);
  const { start, end } = formatTimes(event, event.allDay ? "allDay" : "dateTimeUTC");
  const details = {
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    trp: event.busy,
    dates: start + "/" + end,
  };
  if (event.guests && event.guests.length) {
    details.add = event.guests.join();
  }
  return `https://calendar.google.com/calendar/render?${stringify(details)}`;
};

export const outlook = (calendarEvent) => {
  const event = eventify(calendarEvent);
  const { start, end } = formatTimes(event, "dateTimeWithOffset");
  const details = {
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: start,
    enddt: end,
    subject: event.title,
    body: event.description,
    location: event.location,
    allday: event.allDay || false
  };
  return `https://outlook.live.com/calendar/0/deeplink/compose?${stringify(details)}`;
};

export const office365 = (calendarEvent) => {
  const event = eventify(calendarEvent);
  const { start, end } = formatTimes(event, "dateTimeWithOffset");
  const details = {
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: start,
    enddt: end,
    subject: event.title,
    body: event.description,
    location: event.location,
    allday: event.allDay || false
  };
  return `https://outlook.office.com/calendar/0/deeplink/compose?${stringify(details)}`;
};

export const yahoo = (calendarEvent) => {
  const event = eventify(calendarEvent);
  const { start, end } = formatTimes(event, event.allDay ? "allDay" : "dateTimeUTC");
  const details = {
    v: 60,
    title: event.title,
    st: start,
    et: end,
    desc: event.description,
    in_loc: event.location,
    dur: event.allDay ? "allday" : false
  };
  return `https://calendar.yahoo.com/?${stringify(details)}`;
};

export const ics = (calendarEvent) => {
  const event = eventify(calendarEvent);
  const formattedDescription = (event.description || "")
    .replace(/,/gm, ",")
    .replace(/;/gm, ";")
    .replace(/\r\n/gm, "\n")
    .replace(/\n/gm, "\\n")
    .replace(/(\\n)[\s\t]+/gm, "\\n");

  const formattedLocation = (event.location || "")
    .replace(/,/gm, ",")
    .replace(/;/gm, ";")
    .replace(/\r\n/gm, "\n")
    .replace(/\n/gm, "\\n")
    .replace(/(\\n)[\s\t]+/gm, "\\n");

  const { start, end } = formatTimes(event, event.allDay ? "allDay" : "dateTimeUTC");
  const calendarChunks = [
    {
      key: "BEGIN",
      value: "VCALENDAR",
    },
    {
      key: "VERSION",
      value: "2.0",
    },
    {
      key: "BEGIN",
      value: "VEVENT",
    },
    {
      key: "URL",
      value: event.url,
    },
    {
      key: "DTSTART",
      value: start,
    },
    {
      key: "DTEND",
      value: end,
    },
    {
      key: "SUMMARY",
      value: event.title,
    },
    {
      key: "DESCRIPTION",
      value: formattedDescription,
    },
    {
      key: "LOCATION",
      value: formattedLocation,
    },
    {
      key: "ORGANIZER",
      value: event.organizer,
    },
    {
      key: "END",
      value: "VEVENT",
    },
    {
      key: "END",
      value: "VCALENDAR",
    },
  ];

  let calendarUrl = "";

  calendarChunks.forEach((chunk) => {
    if (chunk.value) {
      if (chunk.key == "ORGANIZER") {
        const value = chunk.value;
        calendarUrl += `${chunk.key};${encodeURIComponent(`CN=${value.name}:MAILTO:${value.email}\n`)}`;
      } else {
        calendarUrl += `${chunk.key}:${encodeURIComponent(`${chunk.value}\n`)}`;
      }
    }
  });

  return `data:text/calendar;charset=utf8,${calendarUrl}`;
};
