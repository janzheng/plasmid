
// this ONLY gets ical of the event! You need server-side to serve the file. The other ones are generated as URLs

import { config } from "dotenv";
import Cytosis from 'cytosis';
// import { cacheGet, cacheSet, cacheClear } from "@/_utils/cache"
import { sendData } from "@/_utils/sapper-helpers" 
import { getContent } from "@/_project/content" 

import send from '@polka/send';
import { google, outlook, office365, yahoo, ics, eventify } from "calendar-link";
// import { eventify } from "calendar-link";

config(); // https://github.com/sveltejs/sapper/issues/122


export async function getEvent() {

  const _results = await getContent()
  let content = _results['Content']
  
  let event = {
    title: Cytosis.findField('_eventName', content, 'Markdown'),
    start: Cytosis.findField('_datetime', content, 'DateTime GMT'),
    end: Cytosis.findField('_datetime', content, 'DateTimeEnd GMT'),
    alarm: Cytosis.findField('_datetime', content, 'Alarm Trigger'),
    description: Cytosis.findField('_eventDescription', content, 'Markdown'),
    // tzid: Cytosis.findField('_dateTime', content, 'Timezone'),
    duration: Cytosis.findField('_eventDuration', content, 'Markdown').split(','),
    url: Cytosis.findField('_eventUrl', content, 'Markdown') || Cytosis.findField('_url', content, 'Markdown'),
    location: Cytosis.findField('_eventLocation', content, 'Markdown'),
    organizer: Cytosis.findField('_eventOrganizer', content, 'Markdown'),
    allDay: Cytosis.findField('_allDay', content, 'Markdown') === 'true',
  }

  return event
}

export async function getIcs() {
  let event = await getEvent()
  return customIcs(event)
}

export async function getIcsDecoded() {
  let event = await getEvent()
  return decodeURIComponent(customIcs(event).split("charset=utf8,")[1])
}




export async function get(req, res) {
  try {
    let event = await getEvent()

    if(req.query.links) {
      sendData({
        googleLink: google(event),
        yahooLink: yahoo(event),
        officeLink: office365(event),
        outlook: outlook(event),
      }, res);
    } else {
      send(res, 200, decodeURIComponent(customIcs(event).split("charset=utf8,")[1]), {
        'Content-Type': 'text/calendar',
        // 'Content-Type': 'text',
      })
    }
	} catch(err) {
		console.error('[ics] api/get error:', err)
		throw new Error('[ics] Error', err)
	}
}









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