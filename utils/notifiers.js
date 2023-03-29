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

*/

import { marked } from 'marked';

import { mailto } from "$plasmid/utils/mailer2"
import { getRecord } from "$plasmid/utils/airfetch"
import { keyRemap, textReplacer, textKeyReplacer } from "$plasmid/utils/helpers"
import { getIcsDecodedFromEvent } from "$plasmid/utils/events/event"

// import { getIcsDecoded } from "@/routes/api/event.js"
// import { trail } from '$plasmid/utils/logger-trails'


// use this pattern to line up multiple senders
// data is e.g. user, form, or airtable data (w/o the .'fields')
export const notify = async ({ data, secret }) => {
  // let p = [sendAbstractToUser(record), sendAbstractToAdmins(record)]
  let p = [
    notifyFromTemplate({
      data,
      secret,
      templateText: 'Hello {{name}}, this is a test email from the notify fn'
    })
  ]
  await Promise.all(p)
  return true
}


// build custom templates from this generic template!
// send notification based on an template in an Airtable content
export const notifyFromTemplate = async ({
  data,
  title = "Email title",
  targetEmail = "jan@phage.directory", // can comma-separate emails
  secret,
  templateText = null, // ='Hello {{name}}, this is a test email.',
  // or instead of templateText, use the following
  templateName = '_email-template-name',
  fieldName = 'Markdown',
  tableName = 'Content',
  loud = true,
  dictMap, // use this simpler dict mapping instead of dictionary
  dictionary = defaultDictionaryFn, // use the dictionary if not using object keys or Airtable field names
  attachment,
  icalEvent, // = { filename: 'event.ics', content: ics_string }
  event, // turned into an icalEvent
}) => {
  try {

    // 1. get the template from Airtable
    // const content = await getContent()
    // const template = content['Content'].find(e => e.fields['Name'] == templateName)
    let templateRecord
    if (!templateText) {
      templateRecord = await getRecord(templateName, tableName, fieldName, true)
      templateText = templateRecord.fields[fieldName]
    }

    if (templateText) {
      // 2. define the dictionary, and replace the template keys with the data
      let md, titleText

      // use the dictmap as dictionary
      /*
        left: new key used in text
        right: key in data 
        "dictMap": {
          "name": "firstName",
          "email": "emailAddress"
        },
      */
      if(dictMap) {
        dictionary = (() => {
          let obj = {}
          Object.keys(dictMap).forEach((key) => {
            obj[key] = data[dictMap[key]] || ' ' // blank space prevents "undefined" to be spelled out
            obj[dictMap[key]] = data[dictMap[key]] || ' ' // mirror old key so it also works
          })
          obj['json'] = JSON.stringify(data, null, 2)
          // console.log('---> dictMap keyObj:', obj)
          return obj
        })
      }

      if (dictionary) {
        md = marked(textReplacer(templateText, data, dictionary))
        titleText = textReplacer(templateRecord?.fields['Title'] || title, data, dictionary)
      } 

      console.log('[notifyFromTemplate]', data, md, titleText)

      if(event) {
        icalEvent = {
          filename: 'event.ics',
          content: await getIcsDecodedFromEvent(event)
        }
      }

      // 3. send the email
      await mailto({
        subject: titleText,
        to: targetEmail, // data['Email'], // explicitly define the email address target so no accidents
        html: md,
        text: md,
        attachment,
        icalEvent,
      }, secret, loud, false)

      return true
    }

    return false

  } catch (err) {
    console.error('[notifyFromTemplate] error:', err)
  } finally {
  }
}




// build a dictionary for text replacement
// e.g. {{name}} template key is to be replaced by the object key [Name] from Airtable etc. 
// takes a data object, and maps a definition to a data source
// retains the original data, plus any new mappings
// ofc keep the original mapping as much as possible to prevent confusion
export const defaultDict = {
  // definition: data source
  // e.g. {{templateKey}}:
  // "{{name}}": "name",
  'name': 'Name',
  'email': 'Email',
  'url': 'URL',
}
export const defaultDictionaryFn = (dataObject, loud = false) => {
  let dictionary = {
    'name': dataObject?.['Name'],
    'email': dataObject?.['Email'],
    'json': JSON.stringify(dataObject, null, 2),
    'id': dataObject?.['Abstract ID'],
    'url': dataObject?.['URL'],
    // ...for abstract data, just use the Airtable column name
    ...dataObject,
    'json': JSON.stringify(dataObject, null, 2),
  }
  if (loud)
    console.log('[[ dictionary ]]', dictionary)
  return dictionary
}
