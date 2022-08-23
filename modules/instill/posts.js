
import { getAtom, getAtoms, putAtom } from './atoms'

export const getPosts = async (source, strict) => {
  return await getAtoms({
    source,
    type: strict ? 'post' : null
  })
}


export const getPostById = async (id) => {
  return await getAtom(id)
  // expand to get all associated atoms like votes to save a server roundtrip?
  // need to getAtoms using the Atom's source
}


export const doPost = async ({ userId, source, ...data }) => {
  return await putAtom({
    userId,
    source,
    type: 'post',
    data: {...data} // title, url, text
  })
}




