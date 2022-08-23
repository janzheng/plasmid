
import { getAtoms, putAtom } from './atoms'

export const getReplies = async (source, threaded=false) => {
  let replies = await getAtoms({
    source,
    type: 'reply',
  })

  // build index of threaded replies into "children" index array
  replies?.forEach(reply => {
    reply.children = replies.filter(r => r.parentId === reply.id).map(r => r.id)
  })

  return replies
}





export const doReply = async ({ userId, source, ...data }) => {
  return await putAtom({
    userId,
    source,
    type: 'reply',
    data: { ...data } // text
  })
}




