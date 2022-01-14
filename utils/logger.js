/* 7/9/2021

	Simple wrapper around logging

	Idea:
	- Create a util logger that either sends to Winston, console.log, or both, and smart enough to route server side or not? Maybe alongside an analytics engine, or maybe they could be both?
    - Events triggered analytics and logger engine?
    - Using the Winston format but adding a simple event registration system like Mixpanel

  - 7/9 replaced with loglevel
    https://www.npmjs.com/package/loglevel 

    loglevel defaults to "warn" log level
    - by default we enable all levels for dev

    log.trace(msg)

    log.log(msg)
      — these are all the same thing
      log.debug(msg) (since 2020, an alias for .info or .log)
      log.info(msg)
      
    log.warn(msg)
    log.error(msg)
	
*/

import log from 'loglevel'
// import * as log from 'loglevel'



// enable all log levels for dev
if(process.env.NODE_ENV == 'development')
  log.enableAll()
  

export default log

// export const _log = (msg) => log.trace(msg)










export const logger = (...args) => {
	/*

		Logger wrapper
		- if opts is a string, it's showing the "source" of the log

	*/
	let source, quiet
	if(typeof opts === 'string') // if opts is a string
		source = opts

	if(typeof opts === 'object') { // otherwise destruct it
		source = opts['source']
		quiet = opts['quiet'] // if quiet, only report errors
		// track events here?
	}

	if(!quiet)
		console.log(...args)
		// console.log(args.splice(0,1)) // remove first arg, and print the others
		// console.log('[logger]', data)
}




export const logerror = (...args) => {
	/*

		Error Logger wrapper
		- if opts is a string, it's showing the "source" of the log

	*/
	let source, quiet
	let opts = args[0] // first arg is always the options
	if(typeof opts == "string") // if opts is a string
		source = opts

	// if(typeof opts == "object") { // otherwise destruct it
	// 	source = opts['source']
	// 	quiet = opts['quiet'] // if quiet, only report errors
	// 	// track events here?
	// }

	// if(!quiet)
		// console.error(args.splice(0,1)) // remove first arg, and print the others
		console.error('[logerror]', ...args)
		// console.error('[logerror]', args)
}



