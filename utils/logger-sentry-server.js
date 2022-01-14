
/* 

  Combines loglevel, sentry for event logging

  - Server-side!
  - otherwise Sentry will yell at you

*/
import {_msg } from '@/_utils/sentry'
import log from '@/_utils/logger'


// logs event to loglevel and Sentry
// only takes a string
/* 
  eventlog(`user loaded: ${user.name}`, '[SignupFinalizePaypal]')
*/
export default function (msg, type='[eventlog]') {
  let str = `${type}: ${msg}`
  _msg(str)
  log.log(str)
}
