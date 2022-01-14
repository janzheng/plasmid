// /*

// 	from: https://github.com/vercel/next.js/tree/canary/examples/with-cookie-auth-fauna

// */

// // logs into fauna
// import { query as q } from 'faunadb'
// import faunadb from 'faunadb'


// // // import cookie from 'cookie'
// // // export const FAUNA_SECRET_COOKIE = 'faunaSecret'

// // export const serverClient = new faunadb.Client({ secret: process.env.FAUNA_SERVER_KEY })


// // // Used for any authed requests.
// // export const faunaClient = secret =>
// //   new faunadb.Client({
// //     secret,
// //   })



// // // no cookies for this demo
// // // export const serializeFaunaCookie = userSecret => {
// // //   const cookieSerialized = cookie.serialize(FAUNA_SECRET_COOKIE, userSecret, {
// // //     sameSite: 'lax',
// // //     secure: process.env.NODE_ENV === 'production',
// // //     maxAge: 72576000,
// // //     httpOnly: true,
// // //     path: '/',
// // //   })
// // //   return cookieSerialized
// // // }




// export const getProfileFromSecret = async faunaSecret => {
// 	console.log('getProfileFromSecret [secret]:', faunaSecret)
// 	const faunaClient = new faunadb.Client({secret: faunaSecret})
//   const ref = await faunaClient.query(q.Identity())
//   return {id: ref.id}
// }
