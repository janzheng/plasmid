

import { tick } from "svelte";
import PocketBase from 'pocketbase';
export const client = new PocketBase('https://redpond.phage.directory');

import { getAtoms, putAtom } from './atoms'



export const getVotesByUser = async (source, userId) => {
  let records = await getAtoms({
    source,
    userId,
    type: 'vote',
    op: '~', // find all items that fuzzy match
  })
  return records[0]
}

export const getVotes = async (source) => {
  return await getAtoms({
    source,
    type: 'vote',
    op: '~', // find all items that fuzzy match
  })
}

export const doUpvote = async ({ id, userId, source, parentId, number }) => {
  return await putAtom({
    id,
    userId,
    source,
    parentId,
    type: 'vote',
    data: {
      number,
    }
  })
}


