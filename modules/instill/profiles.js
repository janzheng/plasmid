


import { writable } from 'svelte/store';
import { get } from 'svelte/store';
import { tick } from "svelte";

import PocketBase from 'pocketbase';
export const client = new PocketBase('https://redpond.phage.directory');




export const getProfileById = async (userid) => {
  await tick() // slow down sending to server
  try {
    let records = await client.Records.getFullList("profiles", 200, {
      filter: `(username='yawnxyz')`
    })
    // console.log('userid returning :::', userid, records)
    return records
  } catch (e) {
    if(e)
      console.error('[getProfileById] error', e, e?.response)
  }
  // return []
}



export const getProfilesBySourceAndId = async (source, userid) => {
  await tick() // slow down sending to server
  try {
    let records = await client.Records.getFullList('profiles', 200, {
      filter: `source='${source}&userId=${userid}'`
    })
    // console.log('getProfilesBySourceAndId returning :::', records)
    return records
  } catch (e) {
    if(e)
      console.error('[getProfilesBySourceAndId] error', e, e?.response)
  }
  // return []
}


export const getProfiles = async () => {
  await tick() // slow down sending to server
  try {
    let records = await client.Records.getFullList('profiles', 200, {
      filter: `(username='yawnxyz')`
    })
    // console.log('getProfiles returning :::', records)
    return records
  } catch (e) {
    if (e)
      console.error('[getProfiles] error', e, e?.response)
  }
  // return []
}
