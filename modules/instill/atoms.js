


import { tick } from "svelte";

import PocketBase from 'pocketbase';
// export const client = new PocketBase('https://pocket.phage.directory');
export const client = new PocketBase('https://redpond.phage.directory');


export const getAtoms = async ({source, type, op='=', userId}) => {
  await tick() // slow down sending to server

  let typeFilter = type ? `&& type='${type}'` : ''
  let userFilter = userId ? `&& userId='${userId}'` : ''

  try {
    let records = await client.Records.getFullList("atoms", 200, {
      filter: `(source${op}'${source}' ${typeFilter} ${userFilter})`,
      // expand: `userId`,
    })
    // votes accumulate in a single record, per user
    console.log('[getAtoms]:', `(source${op}'${source}' ${typeFilter} ${userFilter})`, records)
    return records
  } catch (e) {
    if (e)
      console.error('[getAtoms] error', e, e?.response)
  }
}

// returns all Atoms based on a source, and returns all types in an array
export const getSource = async (source) => {
  let records = await getAtoms({
    source
  })

  if(records) {
    // return records broken down by type
    return records.reduce((acc, record) => {
      acc[record.type] = acc[record.type] || []
      acc[record.type].push(record)
      return acc
    }, {})
  }
}

// gets a single item
export const getAtom = async (id) => {
  await tick() // slow down sending to server
  try {
    let records = await client.Records.getOne("atoms", id)
    return records
  } catch (e) {
    if (e)
      console.error('[getAtom] error', e?.response)
  }
}



// updateAtoms

// insert or append if exists
// -> always explicitly provide data, for easier debugging
export const putAtom = async ({ id, userId, source, parentId, type="vote", data }) => {
  await tick() // slow down sending to server
  try {
    if (id || data?.id) { // id of atom item
      return await client.Records.update("atoms", id || data.id, data)
    } else {
      // create new atom
      console.log('[putAtom] creating new atom', {userId, source, type, data})
      return await client.Records.create("atoms", {
        userId,
        source,
        parentId,
        type,
        ...data,
      })
    }

  } catch (e) {
    // errors happen when too many votes, but they catch up
    if (e)
      console.error('[putAtom] error', e, e?.response)
  }

}

