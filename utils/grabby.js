
/* 

  Endpoint to ser grabby data

  gets stuff from Grabby'd whimsy data (already local); if that doesn't work, use the API

  https://kit.svelte.dev/docs/routing#endpoints

*/
 
import { getBlockValues } from './notion'
import data from '$lib/data/grabbydata.json'

// export const get = getSiteContent // return json from content
export async function _getter({ url }) {
  let id = url.searchParams.get('id')
  if (data && id && data[id]) {
    return { body: data[id] }
  }
  return { status: 400 }
}
// endpoints need {props: ...} for svelte page props to read; and {body: ...} as json data






/*
  Grabs grabbydata.json for Sveltekit Endpoint




  usage:

  import data from '$lib/data/grabbydata.json'
  import { grabber } from '$plasmid/utils/grabby'
  export const get = grabber(data)

*/
export const getGrabby = (data, config) => {
  const _getter = async ({ url }) => {
    let id = url.searchParams.get('id')
    if (data && id && data[id]) {

      // get blocks from whimsy notion, w/o client needing to get block values
      if (config) {
        let source = config.sources.find(f => f.name == id)?.type
        let type = source.type
        if (type == "whimsy" && !source.inputs.ids.includes('collection'))
          return { body: getBlockValues(data[id]) }
      }

      return { body: data[id] }
    }
    return { status: 400 }
  }

  return _getter
}




export const getGrabbyMulti = (data, config) => {
  const _getter = async ({ url }) => {
    let id = url.searchParams.get('id')

    // console.log('grabby multi endpoint ::', id)

    if (!id)
      return { status: 400 }

    let arr = id.split(',')

    if (arr.length > 1) {
      let body = {}

      arr.map(id => {
        let item = data[id]
        if (config) {
          let source = config.sources.find(f => f.name == id)
          let type = source.type
          if (type == "whimsy" && source.inputs.ids && source.inputs.ids.filter(o => o.includes('collection')).length == 0) {
            item = getBlockValues(data[id])
          }
        }
        
        body = { ...body, [id]: item }
      })
      // console.log('[grabby] : body :', id)
      return {
        body: body,
        headers: {
          "content-type": "application/json",
          "accept": "application/json",
        }
      }
    }
    else if (data && id && data[id]) {
      // console.log('[grabby] : data[id] :', id)

      // get blocks from whimsy notion, w/o client needing to get block values
      if (config) {
        let source = config.sources.find(f => f.name == id)
        let type = source.type
        // if (type == "whimsy" && !source.inputs.ids.includes('collection'))
        if (type == "whimsy" && source.inputs.ids && source.inputs.ids.filter(o => o.includes('collection')).length == 0)
          return { body: getBlockValues(data[id]) }
      }

      return {
        body: data[id],
        headers: {
          "content-type": "application/json",
          "accept": "application/json",
        }
      }
    }
    return { body: {} }
  // return { status: 400 }
  }

  return _getter
}