
/*  Last updated: 1/12/2021

  Mailer — a way to send mail

  - can't use mailgun.js because the (more secure) nodemailer can't be used on Vercel anymore (2020) b/c of AWS change
  - combined mailer w/ notifier for a united file; two ways to send mail though
  - stripped mailer of project-specific code — only used to send mail w/ received data now

  1/12/2021: switched to Mailgun.js package: https://www.npmjs.com/package/mailgun.js
  
*/

import { checkToken } from "$plasmid/utils/env-helpers"

import Mailgun from 'mailgun.js'; // insecure, uses private API, but works better w/ Vercel
import formData from 'form-data';
// import MailComposer from 'nodemailer/lib/mail-composer'; 
import { config } from "dotenv";
// import { trail } from './logger-trails';

config() // https://github.com/sveltejs/sapper/issues/122
// import uuid from 'uuid-by-string';
const mailgun = new Mailgun(formData)

let mg, senderName, senderEmail, senderReplyEmail

// MAILGUN INIT
if(process.browser != true && process.env.MG_API && process.env.MG_DOMAIN && process.env.MG_SENDER_EMAIL) {
	mg = mailgun.client({
    username: 'api',
	  key: process.env.MG_API, // app.get('smtp').user,
	})
  senderEmail = process.env.MG_SENDER_EMAIL || 'hello@phage.directory'
  senderName = process.env.MG_NAME || 'Phage Directory'
  senderReplyEmail = process.env.MG_REPLY_EMAIL || 'hello@phage.directory'
}

let headers = {
  fromName: `${senderName}`,
  fromEmail: `${senderEmail}`,
  replyTo: `${senderName}`,
  replyEmail: `${senderReplyEmail}`,

  // replace these in the app!
  to: 'hello@phage.directory', // comma separated emails
  subject: 'Email subject',
  // html: '<p>Hello World!</p>', // html should be optional; default to undefined to force text
  text: 'Hello World!'
}

export const setup = (data) => {
  // spread-out  to prevent any side effects
  headers['fromName'] = data['fromName']
  headers['fromEmail'] = data['fromEmail']
  headers['replyTo'] = data['replyTo']
  headers['replyEmail'] = data['replyEmail']
  headers['to'] = data['to']
  headers['subject'] = data['subject']
  headers['html'] = data['html'] || data['text']
  headers['text'] = data['text']
}



// const mailOptions = {
//   from: 'tester@phage.directory',
//   subject: 'Hello',
//   text: 'Testing Mailgun attachments.',
//   attachments: [
//     { // utf-8 string as an attachment
//       filename: 'text.txt',
//       content: 'For testing just a text file. This could be a ReadStream, Buffer or other.'
//     }
//   ]
// };
// export const compose = async (mailData) => {

//   if(!mailData || !mailData['to'] || !mailData['subject'] || !(mailData['text'] || mailData['html'])){
//     console.error('[sendMail] error: provide to, template/html, and subject', mailData)
//     return
//   }

//   let emailAddr = mailData['to']

// 	// MG_SEND_ON used to deactivate sending from env as a breaker
// 	if(process.env.MG_SEND_ON !== 'true') {
// 		console.error('[mailer] MG_SEND is turned off')
// 		// throw new Error('[sendMail] MG_SEND is turned off')
// 		return
// 	}

//   let mail = new MailComposer(mailData);
//   mail.compile().build(function(mailBuildError, message) {

//     var dataToSend = {
//       to: emailAddr,
//       message: message.toString('ascii')
//     };

//     mg.messages().sendMime(dataToSend, function(sendError, body) {
//       console.log('[compose] Sent:', body, "[errors?]", sendError)
//       if (sendError) {
//         console.log(sendError);
//         return;
//       }
//     });
//   });
// }






// abstract  way to send emails — deliberately force each value
export const mailto = async (data, secret, loud = false, trail = false) => {

  try {
    const fromName = data['fromName'] || headers['fromName']
    const fromEmail = data['fromEmail'] || headers['fromEmail']
    // const replyTo = data['replyTo'] || headers['replyTo']
    const replyEmail = data['replyEmail'] || headers['replyEmail'] || fromEmail
    const subject = data['subject'] || headers['subject']
    const text = data['text'] || headers['text']
    const html = data['html'] || headers['html']
    // always use arrays for attachment
    // https://nodemailer.com/message/attachments/ | https://www.npmjs.com/package/mailgun.js
    let to = data['to'] || headers['to']
    let attachment = data['attachment'] || []
    const icalEvent = data['icalEvent']

    /* 
      OLD; mailgun.js doesn't support ical shortcut
      check: https://github.com/mailgun/mailgun.js/issues/280
      for icalEvent, use:
      icalEvent: {
        filename: 'event.ics',
        content: ics, // <-- the content of an ics file, e.g. BEGIN:VCALENDAR...
      }

      Attachment (singular) looks like:

      const firstFile = {
          filename: 'test.pdf',
          data: await fsPromises.readFile(filepath) // this is the file buffer
      }

      messageParams.attachment = [firstFile, secondFile];

    */

    if (process.env.MG_SECRET)
      console.warn('MG_SECRET is deprecated! Replace with SECRET_PAIRS')

    // deprecated; use SECRET_PAIRS instead; keep around for debugging
    if (process.env.MG_SECRET && (secret != process.env.MG_SECRET) ) {
      throw new Error('Please provide a valid secret key and/or define the MG_SECRET')
      return
    }

    if (checkToken(secret).includes('demo')) {
      // check for the secret here; if demo, force email address here
      console.warn('[mailer] demo mode: not sending public emails; redirecting to [jan@phage.directory]')
      to = "jan@phage.directory"
    } 


    // coerce array to be an array; this probably won't work
    if(!Array.isArray(attachment))
      attachment = [attachment]

    let icalFile = {}
    if(icalEvent) {
      // console.log('[mailer] icalEvent', icalEvent)
      let contentBuffer = Buffer.from(icalEvent.content, 'utf-8')
      icalFile = {
        filename: icalEvent.filename,
        // data is the filebuffer of content
        data: contentBuffer,
        contentType: 'application/ics'
      }
      attachment = [icalFile, ...attachment ]
    }

		// console.log('[notify] sending out notification', mailData)
    // const res = await sendMail(mailData)
    // const res = await compose(mailData)

    const mailData = {
      from: `${fromName} <${fromEmail}>`,
      // 'reply-to': `"${replyTo}" <${replyEmail}>`,
      'h:Reply-To': `${replyEmail}`,
      to: [`${to}`],
      subject: subject,
      text: text,
      html: html || text,
      attachment
    }

    let msg
    if(process.env.MG_ENABLED === 'true') {
      msg = await mg.messages.create(process.env.MG_DOMAIN, mailData)
      if(loud)
        console.log(`[mailto] Email sent to: ${to}`, msg , mailData)
    } else {
      throw new Error('Must enable email via env var MG_ENABLED')
    }


    // if(loud)
      // trail(`[Mailer] Email sent to: ${to}`, mailData)

    return msg

  } catch (e) {
    console.error(e)
    throw new Error(e)
  }
}


