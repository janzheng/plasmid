

// sveltekit
// to use secret — set VITE_DEPLOY_SECRET in .env
// then ping /api/redeploy?secret=SECRET

export const redeploy = ({ url }) => {
  let secret = url.searchParams.get('secret')
  if (import.meta.env.VITE_DEPLOY_SECRET && secret == import.meta.env.VITE_DEPLOY_SECRET) {
    return {
      status: 302,
      headers: { Location: import.meta.env.VITE_DEPLOY }
    }
  }
  else if (!import.meta.env.VITE_DEPLOY_SECRET) {
    return {
      status: 302,
      headers: { Location: import.meta.env.VITE_DEPLOY }
    }
  }

  // bad request // secret didn't work
  return { status: 500, body: 'incorrect secret' }
}


