

// sveltekit
// to use secret — set VITE_DEPLOY_SECRET in .env
// then ping /api/redeploy?secret=SECRET

export const redeploy = ({ url }) => {
  let secret = url.searchParams.get('secret')
  console.log('Secret:', secret, '.env secret:', process.env.VITE_DEPLOY_SECRET)
  if (process.env.VITE_DEPLOY_SECRET && secret == process.env.VITE_DEPLOY_SECRET) {
    return {
      status: 302,
      headers: { Location: process.env.VITE_DEPLOY }
    }
  }
  else if (typeof(process.env.VITE_DEPLOY_SECRET) == 'undefined') {
    return {
      status: 302,
      headers: { Location: process.env.VITE_DEPLOY }
    }
  }

  // bad request // secret didn't work
  return { status: 400, body: 'incorrect secret' }
}



// export const redeploy = ({ url }) => {
//   let secret = url.searchParams.get('secret')
//   console.log('vite deploy secret: ', import.meta.env.VITE_DEPLOY_SECRET)
//   if (import.meta.env.VITE_DEPLOY_SECRET && secret == import.meta.env.VITE_DEPLOY_SECRET) {
//     return {
//       status: 302,
//       headers: { Location: import.meta.env.VITE_DEPLOY }
//     }
//   }
//   else if (!import.meta.env.VITE_DEPLOY_SECRET) {
//     return {
//       status: 302,
//       headers: { Location: import.meta.env.VITE_DEPLOY }
//     }
//   }

//   // bad request // secret didn't work
//   return { status: 500, body: 'incorrect secret' }
// }


