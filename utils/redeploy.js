

// sveltekit

export const redeploy = ({ url }) => {
  let secret = url.searchParams.get('secret')
  if (import.meta.env.VITE_DEPLOY_SECRET && secret == import.meta.env.VITE_DEPLOY_SECRET) {
    return {
      status: 302,
      headers: { Location: import.meta.env.VITE_DEPLOY }
    }
  }

  if (!import.meta.env.VITE_DEPLOY_SECRET) {
    return {
      status: 302,
      headers: { Location: import.meta.env.VITE_DEPLOY }
    }
  }
}


