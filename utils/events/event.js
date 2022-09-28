
// this ONLY gets ical of the event! You need server-side to serve the file. The other ones are generated as URLs


// import cytosis from 'cytosis';
// import { cacheGet, cacheSet, cacheClear } from "@/_utils/cache"
// import { sendData } from "@/_utils/sapper-helpers"
import { cytosis, getContent } from "$plasmid/utils/airfetch.js"

// import send from '@polka/send';
// import { google, outlook, office365, yahoo, ics } from "calendar-link";
import cal from 'calendar-link'; // eventify not getting imported
const { google, outlook, office365, yahoo, ics, eventify } = cal;


import { config } from "dotenv";
config(); // https://github.com/sveltejs/sapper/issues/122



// ripped from calendar-link since not exported
// import dayjs from 'dayjs';
// export const eventify = (event) => {
//   const { start, end, duration, ...rest } = event;
//   const startUtc = dayjs(start).utc();
//   const endUtc = end
//     ? dayjs(end).utc()
//     : (() => {
//       if (event.allDay) {
//         return startUtc.add(1, "day");
//       }
//       if (duration && duration.length == 2) {
//         const value = Number(duration[0]);
//         const unit = duration[1];
//         return startUtc.add(value, unit);
//       }
//       return dayjs().utc();
//     })();
//   return {
//     ...rest,
//     startUtc,
//     endUtc,
//   };
// };



// TODO: do a getEvent but w/ the event object passed in


// get event from custom Airtable (look @ Evergreen example)
export async function getEventFromContent() {

  const _results = await getContent()
  let content = _results['Content']

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
  if (!event) await getEventFromContent()
  return customIcs(event)
}

export async function getIcsDecodedFromEvent(event) {
  if (!event) await getEventFromContent()
  return decodeURIComponent(customIcs(event).split("charset=utf8,")[1])
}



export async function getEventLinks(event) {
  if (!event) await getEventFromContent()
  try {
    return {
      googleLink: google(event),
      yahooLink: yahoo(event),
      officeLink: office365(event),
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
//         googleLink: google(event),
//         yahooLink: yahoo(event),
//         officeLink: office365(event),
//         outlook: outlook(event),
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




const TimeFormats = {
  dateTimeWithOffset: "YYYY-MM-DD[T]HH:mm:ssZ",
  dateTimeUTC: "YYYYMMDD[T]HHmmss[Z]",
  allDay: "YYYYMMDD",
};
function formatTimes({ allDay, startUtc, endUtc, alarmUtc }, dateTimeFormat) {
  const format = TimeFormats[allDay ? "allDay" : dateTimeFormat];
  return { start: startUtc.format(format), end: endUtc.format(format) };
}