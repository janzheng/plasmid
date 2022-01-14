
/* 

  NOT IMPLEMENTED YET — use triggers instead

  External or webhook-triggered email senders
  - make sure to validate against an ENV!

*/




import { config } from "dotenv";

import send from '@polka/send';

import { getUserFromCode } from "@/_project/registration" 

config(); // https://github.com/sveltejs/sapper/issues/122






export async function post(req, res) {
  const { type, key, ticketId} = req.body
  console.log(req.body)

  try {
    if(!key || key != process.env.SENDER_KEY || !process.env.SENDER_KEY) {
      return send(res, 200, 'Nothing sent; ID incorrect', {
        'Content-Type': 'text',
      })
    }


 
    let msg = ''

    if(type === 'send_registration_info') {
      if(!ticketId)
        return send(res, 200, 'Need a user ID', {'Content-Type': 'text'})

      let user = getUserFromCode(ticketId)
      // msg = await testTrigger()
    }

    // don't return errors!
    return send(res, 200, `[Sender run successfully] ${msg} for: [${type}]`, {
      'Content-Type': 'text',
      // 'Content-Type': 'text',
    })


	} catch(err) {
		console.error('[senders] api/get error:', err)
		throw new Error('[senders] Error', err)
	}
}



