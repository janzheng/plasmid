

/*

  this is setup for Google Analytics 4 which is like mixpanel

last updated: 11/17/2020

*/



let gtagOn = process.env.GA_ON
let gtagDebug = process.env.GA_DEBUG == 'true' ? true : false
let gtag = undefined // needs to be passed in by front-end
let person = [] // ['id',{person details}]

// set a custom mixpanel obj like client obj
export const _set = (_gtag) => {
  gtag = _gtag
}

export const _gatrack = (eventName, obj) => {
  if(gtag) {
    gtag('event',eventName,{...obj, 'debug_mode':gtagDebug})
  }
}