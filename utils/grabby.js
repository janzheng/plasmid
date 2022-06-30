
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
export const grabbyGetter = (data, config) => {
  const _getter = async ({ url }) => {
    let id = url.searchParams.get('id')
    if (data && id && data[id]) {

      // get blocks from whimsy notion, w/o client needing to get block values
      if (config) {
        let type = config.sources.find(f=>f.name==id).type

        console.log('returning data:', type, id, getBlockValues(data[id]))
        if (type == "whimsy")
          return { body: getBlockValues(data[id]) }
      }

      return { body: data[id] }
    }
    return { status: 400 }
  }

  return _getter
}