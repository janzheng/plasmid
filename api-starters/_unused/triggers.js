
import { config } from "dotenv";
import { trail } from '@/_utils/logger-trails'
import { testTrigger, customSender } from "@/_project/triggers" 

import send from '@polka/send';

config(); // https://github.com/sveltejs/sapper/issues/122













export async function get(req, res) {
  console.log(req.query)
  try {
    if(!req.query.id || req.query.id != process.env.TRIGGER_ID) {
      return send(res, 200, 'Event not triggered; ID incorrect', {
        'Content-Type': 'text',
      })
    }

    if(!req.query.id || !req.query.trigger) {
      return send(res, 200, '[Specify a trigger]', {
        'Content-Type': 'text',
      })
    }



    trail(`[Trigger] ID:${req.query.id} - Trigger: ${req.query.trigger}`)

    let msg = ''

    if(req.query.trigger === 'testTrigger')
      msg = await testTrigger()

    if(req.query.trigger === 'customSender')
      msg = await customSender(req)

    return send(res, 200, `[Event triggered successfully] ${msg} for trigger: [${req.query.trigger}]`, {
      'Content-Type': 'text',
      // 'Content-Type': 'text',
    })


	} catch(err) {
		console.error('[triggers] api/get error:', err)
		throw new Error('[triggers] Error', err)
	}
}



