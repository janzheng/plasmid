
// import { query as q } from 'faunadb'
// import faunadb from 'faunadb'

// // import { cacheGet, cacheSet, cacheClear } from "../cache"




// export const getComments = async (locId) => {

//   try {

//     if(!process.env.FAUNA_COMMENTS_KEY) {
//       console.error('[getComments] No access to Fauna')
//       return undefined
//     } 

//     const client = new faunadb.Client({ secret: process.env.FAUNA_COMMENTS_KEY })
//     let comments
//     // console.log('LOC ID GRABBING:', locId)

//     if(!locId) {
// 	    comments = await client.query(
// 	      q.Map( // array of comments
// 	        q.Paginate(
// 	          q.Match(q.Index('papersh-all-comments')),
// 	          { size: 100 }
// 	        ),
// 	        q.Lambda('X',q.Get(q.Var('X')))
// 	      )
// 	    )
//     } else {
// 	    comments = await client.query(
// 	      q.Map( // array of comments
// 	        q.Paginate(
// 	          q.Match(q.Index('papersh-comments-by-location'), locId),
// 	          { size: 100 }
// 	        ),
// 	        q.Lambda('X',q.Get(q.Var('X')))
// 	      )
// 	    )
//     }

// 		// const data = await response.json();
//     // console.log('comments:', comments)

//     // whitelist
//     const clean = {data: comments.data.reduce((acc,val) => {
//       // console.log('messages::::', val)
//       return [...acc, {
//         comment: val.data.comment,
//         _phid: val.data._phid,
//         locId: val.data.locId,
//         ts: val.ts,
//       }]
//     },[])}

//     return clean
//   } catch (error) {
//     console.error('[getComments] error', error)
//   }

// }




// // locId: (optional) specifies the slug or location of the post (for perma-url)
// // user: user info; use _phid to track back to the user
// // post: post data (usually a message) 
// export const postComment = async (locId, user, comment) => {

//   if(!process.env.FAUNA_COMMENTS_KEY) {
//     console.error('[getComments] No access to Fauna')
//     return undefined
//   } 


//   const client = new faunadb.Client({ secret: process.env.FAUNA_COMMENTS_KEY })

//   // console.log('postComment:', locId, user, comment)

//   const data = {
// 		_phid: user['_phid'],
// 		comment,
// 		locId,
//   }

//   const queryResponse = await client.query(
//     q.Create(
//     	q.Collection('papersh-comments'),
//     	{data} // shape is { data: } — we want the data object in here
//     )
//   )

//   return queryResponse
// }




// export const getCommentCount = async (locId) => {

//   if(!process.env.FAUNA_COMMENTS_KEY) {
//     console.error('[getComments] No access to Fauna')
//     return undefined
//   } 


//   try {
//     const client = new faunadb.Client({ secret: process.env.FAUNA_COMMENTS_KEY })
//     let count
//     // console.log('[Fauna:Comments] Counting:', locId)

//     count = await client.query(
//       q.Count( // array of comments
//         q.Match(q.Index('papersh-comments-by-location'), locId)
//       )
//     )
//     console.log('[Fauna:Comments] Count:', count)

//     return count
//   } catch (error) {
//     console.error('[Fauna:Comments] error', locId, error)
//   }
// }



// export const getCommentCounts = async (locIds) => {

//   if(!process.env.FAUNA_COMMENTS_KEY) {
//     console.error('[getComments] No access to Fauna')
//     return undefined
//   } 


//   try {
//     const client = new faunadb.Client({ secret: process.env.FAUNA_COMMENTS_KEY })
    
//     // console.log('[Fauna:Comments] Counting:', locIds)

//     let queries = []
//     locIds.split(',').map(locId => {
//       queries.push(q.Count(q.Match(q.Index('papersh-comments-by-location'), locId)))
//     })

//     // an array of all the locIds and their counts
//     let counts = await client.query(queries)

//     // ex of dynamically inserting many queries:
//     // count = await client.query(
//     //   [ q.Count( q.Match(q.Index('papersh-comments-by-location'), 'appt2SFxpb8nryVjF-reckCdIntvP7meI3w')), 
//     //     q.Count( q.Match(q.Index('papersh-comments-by-location'), 'appt2SFxpb8nryVjF-recbjfspryaAXUDr0'))
//     //   ]
//     // )

//     let countObj = {}

//     // zipper the data together into an object that's easy to reference
//     locIds.split(',').map((locId,i) => {
//       countObj[locId] = counts[i]
//     })

//     // console.log('[Fauna:Comments] Multiple Count:', countObj)

//     return countObj
//   } catch (error) {
//     console.error('[Fauna:Comments] error', error)
//   }

// }





// // export async function post(req, res, next) {

// //   const { sigName, sigMessage, sigPointer } = req.body
// //   const secret = req.session.secret

// //   try {
    
// // 		// const user = await getProfile(secret)
// //   	console.log('[messages] creating signature::::', sigName, sigMessage, sigPointer)

// //     const client = new faunadb.Client({ secret: process.env.FAUNA_GUESTBOOK_KEY })

// //     const data = {
// // 			username: sigName,
// // 			message: sigMessage,
// // 			pointer: sigPointer
// //     }
// //     const queryResponse = await client.query(
// //       q.Create(
// //       	q.Collection('Guestbook'),
// //       	{data} // shape is { data: } — we want the data object in here
// //       )
// //     )

// //     // const signatureInfo = { name: queryResponse.data.name, message: queryResponse.data.message, _ts: queryResponse.ts, ref: queryResponse.ref}
// //  		// console.log('sig info / success!', signatureInfo)

// // 		// const data = await response.json();
// // 		res.writeHead(200, { 'Content-Type': 'application/json' })
// // 		res.end(JSON.stringify(data))

// //   } catch (error) {
// //     console.error('signature.js create error:', error)
// //     res.statusCode = 403
// //     res.end()
// //     // next(error)
// //   }
// // }


