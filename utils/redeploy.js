

// sveltekit
// to use secret — set VITE_DEPLOY_SECRET in .env
// then ping /api/redeploy?secret=SECRET

export const redeploy = ({ url }) => {
  let secret = url.searchParams.get('secret')
  console.log('Secret:', secret, '.env secret:', process.env.VITE_DEPLOY_SECRET)
  if (process.env.VITE_DEPLOY_SECRET && secret == process.env.VITE_DEPLOY_SECRET) {
    console.log('Redeploying with secret')
    return {
      status: 302,
      headers: { Location: process.env.VITE_DEPLOY }
    }
  }
  else if (typeof (process.env.VITE_DEPLOY_SECRET) == 'undefined') {
    console.log('Redeploying without secret')
    return {
      status: 302,
      headers: { Location: process.env.VITE_DEPLOY }
    }
  }

  // bad request // secret didn't work
  console.log('Incorrect secret')
  return { status: 400, body: 'incorrect secret' }
}









import { redirect, error } from '@sveltejs/kit';
import { PUBLIC_DEPLOY } from '$env/static/public';
import { DEPLOY_SECRET } from '$env/static/private';

// this is meant for server-side sveltekit
export const redeploy_new = ({ url }) => {
  let secret = url.searchParams.get('secret')
  console.log('Secret:', secret, '.env secret:', DEPLOY_SECRET, secret === DEPLOY_SECRET)
  if (DEPLOY_SECRET && secret === DEPLOY_SECRET) {
    console.log('Redeploying with secret', PUBLIC_DEPLOY)
    // throw redirect(302, PUBLIC_DEPLOY)
    return new Response('Redeploying with secret', {
      status: 302,
      headers: { Location: PUBLIC_DEPLOY }
    })
  }
  else if (typeof (DEPLOY_SECRET) == 'undefined') {
    console.log('Redeploying without secret')
    // throw redirect(302, PUBLIC_DEPLOY)
    return new Response('Redeploying with secret', {
      status: 302,
      headers: { Location: PUBLIC_DEPLOY }
    })
  }

  // bad request // secret didn't work
  console.log('Incorrect secret')
  return new Response(
    'incorrect secret',
    {status: 400}
  )
  // return { status: 400, body: 'incorrect secret' }
  // throw error(400, 'incorrect secret')
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


