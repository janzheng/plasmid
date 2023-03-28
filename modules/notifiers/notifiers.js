/* 

  Project-specific mailers and notifiers

  ** Notifiers are at the heart of email notifications, including signups and password recovery

  workflow:
  1. select which notifier to use (mail to admin, subscriber, etc.) — these are actions
  2. notifier gets the data
  3. notifier retrieves the template (if there is one) from email-templates, from Airtable
    - define dictionary if necessary
  4. notifier does a keyreplace so the right data (e.g. name, email) is added to the template
  5. notifier sends the email(s) using mailer

  These are usually heavily project-centric, so copy this example into your _project folder
  
  // not that this example is DEPRECATED
  // see the new version in src/plasmid/utils/notifiers.js

*/

import marked from 'marked';
import Cytosis from 'cytosis';

import { mailto } from "@/plasmid/utils/mailer.js"

import { getContent } from "@/plasmid/utils/airfetch"
import { keyReplace } from "@/plasmid/utils/helpers.js"
import { dict, textReplacer } from "./app-helpers.js"
import { getIcsDecoded } from "@/routes/api/event.js"

// import { trail } from '@/plasmid/utils/logger-trails'




// key replacer dictionary / translator for filling in template data
// const keyDict = (data)  => {
//   console.log('[keyDict]', data)
// 	return {
//     ...data
// 		// name: `${data['name']}`,
// 		// email: `${data['email']}`,
// 	}
// }



/* 

  Notification Templates

*/

// send receipt to customer
export const sendReceiptToCustomer = async (data, templateName = '_email-receipt') => {
  try {
    // console.log('[sendReceiptToCustomer] data:', data)
    const _dict = dict(data)
    const content = await getContent()
    const template = content['Content'].find(e => e.fields['Name'] == templateName)
    let ics = await getIcsDecoded()

    const replaced = textReplacer(template.fields['Markdown'], _dict)
    const md = marked(replaced)

    // console.log('[sendReceiptToCustomer]', md)

    mailto({
      subject: `You’re Registered for Evergreen 2021!`,
      to: data['email'],
      html: md,
      text: md,
      icalEvent: {
        filename: 'event.ics',
        method: 'request',
        content: ics
      }
    })

    return true
  } catch (err) {
    console.error('[sendReceiptToCustomer] error:', err)
  } finally {
  }
}


// notify admins that someone purchased
export const sendInfoToAdmin = async (data, templateName = '_email-admin') => {
  try {
    const _dict = dict(data)
    const content = await getContent()
    const template = content['Content'].find(e => e.fields['Name'] == templateName)

    const replaced = textReplacer(template.fields['Markdown'], _dict)
    const md = marked(replaced)

    // console.log('[sendInfoToAdmin]', md)

    mailto({
      subject: `New Reg: ${data['name']} ${data['email']}`,
      to: process.env.EMAIL_ADMINS, // tescphage@gmail.com
      html: md,
      text: md,
    })

    return true

  } catch (err) {
    console.error('[sendReceiptToCustomer] error:', err)
  } finally {
  }
}






// send an email template to ALL attendees
// doesn't use dict for replacement; uses Airtable fields schema instead for users
export const sendGroupEmailToAttendees = async (templateName, view = 'Grid view') => {
  if (!templateName || process.env.GROUP_EMAILS_ON !== 'true') {
    console.error('GROUP_EMAILS is turned off for', templateName, view, process.env.GROUP_EMAILS_ON)
    return false
  }


  try {

    // console.log('loading cytosis...', bases)
    let _cytosis = await new Cytosis({
      apiKey: process.env.AIRTABLE_PRIVATE_API,
      baseId: process.env.AIRTABLE_PRIVATE_BASE,
      bases: [{
        tables: ["Attendees"],
        options: { "view": view, }
      }]
    })

    const attendees = _cytosis.results['Attendees']

    const content = await getContent()
    const template = content['Content'].find(e => e.fields['Name'] == templateName)

    // console.log('[sendGroupEmailToAttendees]', attendees)


    // trail(`[sendGroupEmailToAttendees] Group email: ${templateName} - view: ${view} - # emails: ${attendees.length}`)

    // build template and send to each person
    attendees.map(user => {
      const replaced = keyReplace(template.fields['Markdown'], {
        ...user.fields,
        ticketprice: user.fields['Ticket Price'],
        ticketId: user.fields['Ticket ID']
      })
      const md = marked(replaced)

      // DO NOT UNCOMMENT UNTIL USING OFFICIALLY
      if (template.fields['Title'] && md && user.fields['Email'])
        mailto({
          subject: template.fields['Title'],
          to: user.fields['Email'], // tescphage@gmail.com
          html: md,
          text: md,
        })

    })

    return true

  } catch (err) {
    console.error('[sendReceiptToCustomer] error:', err)
  } finally {
  }
}