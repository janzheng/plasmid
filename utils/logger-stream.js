
/* 

  Uses pino and integrates vercel to log messages to Logflare

  - https://github.com/Logflare/next-pino-logflare-logging-example/blob/main/logger/logger.js 
  - both server and browser
  - make sure to also add pino-pretty as a --dev dependency!


  import logstream from '@/_utils/logger-stream'
  logstream.log('SignupFinalizePaypal', `INFO::: user exists: ${user.name}`, user)
  logstream.warn('SignupFinalizePaypal', `WARN::: user exists: ${user.name}`, user)
  logstream.error('SignupFinalizePaypal', `ERROR::: user exists: ${user.name}`, user)
  
  */


import pino from 'pino'
import { logflarePinoVercel } from 'pino-logflare'

let logger

// Logflare logger
if(process.env.LOGFLARE_API && process.env.LOGFLARE_SOURCE) {
  const {stream, send} = logflarePinoVercel({
    apiKey: process.env.LOGFLARE_API,
    sourceToken: process.env.LOGFLARE_SOURCE
  })
  logger = pino({
    prettyPrint: process.env.NODE_ENV == 'development' ? true : false,
    browser: {
      transmit: {
        level: "info",
        send: send,
      }
    },
    level: "debug",
    base: {
      env: process.env.NODE_ENV,
      revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
    },
  }, stream)
  console.log('[LoggerStream] Logflare has been set up with Vercel + Logflare')
} else {
  // basic browser logger
  logger = pino({
    prettyPrint: process.env.NODE_ENV == 'development' ? true : false
  })
  console.log('[LoggerStream] Logflare has been set up Locally')
}



function Logstream() {
  this.log = (from, msg, data) => {
    let str = `[${from}]: ${msg}`
    logger.info(str, data)
  }

  this.error = (from, msg, data) => {
    let str = `[${from}]: ${msg}`
    logger.error(str, data)
  }

  this.warn = (from, msg, data) => {
    let str = `[${from}]: ${msg}`
    logger.warn(str, data)
  }
}

export default new Logstream()