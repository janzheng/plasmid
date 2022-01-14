


/*

  server-side node-based mixpanel, not for client

  last updated: 11/17/2020

*/

import Mixpanel from 'mixpanel'


let mixpanelOn = process.env.MIXPANEL_ON
let mixpanel = Mixpanel && mixpanelOn ? Mixpanel.init(process.env.MIXPANEL) : undefined
let person = [] // ['id',{person details}]

// set a custom mixpanel obj like client obj
export const _set = (mixpanelObj) => {
  mixpanel = mixpanelObj
}

export const _track = (eventName, obj) => {
  if(mixpanel) {
    mixpanel.track(eventName,obj)
  }
}

export const _time = (eventName) => {
  if(mixpanel) {
    mixpanel.track(eventName, {time: new Date()})
  }
}


// lots more mixpanel.people options: https://www.npmjs.com/package/mixpanel
export const _person = (id, data) => {
  if(mixpanel) {
    mixpanel.people.set(id, data)
  }
}
