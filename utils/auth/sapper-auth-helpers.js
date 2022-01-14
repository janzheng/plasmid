

import { goto } from '@sapper/app';
import { getContext, setContext } from 'svelte'

import { getUser } from './get-user';
import { fetchPost } from '../fetch-helpers';
import { logger, logerror } from '../logger';

import { User } from '../../stores/stores.js';


// (fauna login example)
export const login = ({email, password, session}) => {
  // console.log('loggin in....', email, password, JSON.stringify({ email, password }) )
	return fetch(`api/auth/login`, {
		method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
	}).then(async (response) => {
		console.log('response:', response)

		if(response.status === 403)
			return Promise.reject()

		let data = await response.json()

		if (data.user) {
			session.set({ user: data.user });
			return Promise.resolve()
		}
	})
}



/*

  Svelte / Passport auth helpers

*/





// uses the passport server routes
export const handleOauth = async (event, service='google') => {
  if(event)
    event.preventDefault()
  goto(`/auth/${service}`)
}


// Handle log-in w/ sapper-passport-airtable
export const handleLogin = async (event, data) => {
  if(event)
    event.preventDefault()

  try {

    if(process && process.browser === true) {
      const response = await fetchPost('/api/passport/login', data, fetch)

      if(response.status == 200) {
        const results = await response.json()
        console.log('[handleLogin] Logged in:', results)
        if(results.user) {
          logger('[handleLogin]', 'LOGGED IN!:', results)
          User.set(results.user) // update the store object
          goto('/')
        } else {
          logger('[handleLogin]', 'NOT LOGGED IN!:', results)
          return results
        }
      }

    }
  } catch (err) {
    console.error(err)
    return err
  }
}



export const handleMagicLogin = async (event, data) => {
  if(event)
    event.preventDefault()

  try {

    if(process && process.browser === true) {
      const response = await fetchPost('/api/passport/magic', data, fetch)

      if(response.status == 200) {
        const results = await response.json()
        return results
      }

    }
  } catch (err) {
    logerror('[handleMagicLogin]', 'Error:', err)
    return err
  }
}



export const handleMagicAuth = async (event, data) => {
  if(event)
    event.preventDefault()

  try {
    if(process && process.browser === true) {

      const response = await fetch(`/api/passport/magic/${data.token}`)

      logger('[handleMagicAuth]', 'response:', response)

      if(response && response.status == 200) {
        const results = await response.json()
        logger('[handleMagicAuth]', 'Signed up:', results)
        if(results.status == true) {
          User.set(results.user) // update the store object
          goto('/profile')
        }

        return results
      }

      return {
        status: false,
        message: 'Log in token is incorrect',
      }
    }

  } catch (err) {
    // console.error(err)
    logerror('[handleMagicAuth]', 'Error:', err)
    return
  }
}







export const handleActivate = async (event, data) => {
  if(event)
    event.preventDefault()

  try {

    if(process && process.browser === true) {
      const response = await fetchPost('/api/passport/activate', data, fetch)

      if(response.status == 200) {
        const results = await response.json()
        console.log('handleActivate res:', results)
        return results
      }

    }
  } catch (err) {
    logerror('[handleActivate]', 'Error:', err)
    return err
  }
}



export const handleActivateAuth = async (event, data) => {
  if(event)
    event.preventDefault()

  try {
    if(process && process.browser === true) {

      const response = await fetch(`/api/passport/activate/${data.token}`)

      logger('[handleActivateAuth]', 'response:', response)

      if(response && response.status == 200) {
        const results = await response.json()
        logger('[handleActivateAuth]', 'Signed up:', results)
        if(results.status == true) {
          User.set(results.user) // update the store object

          // go to another username + password-setting page?
          goto('/profile')
        }

        return results
      }

      return {
        status: false,
        message: 'Activation token is incorrect',
      }
    }

  } catch (err) {
    // console.error(err)
    logerror('[handleActivateAuth]', 'Error:', err)
    return
  }
}








export const handleLogout = async (event) => {
  if(event)
    event.preventDefault()

  // const User = getContext('User')

  try {
    const response = await fetch(`/api/passport/logout`)
    logger('[handleLogout]', 'Logout response:', response)
    if(response.status == 200) {
      const results = await response.json()
      User.set({})
      logger('[handleLogout]', 'Logged Out:', response)
      goto('/')
    } else {
      return false
    }

    return false

  } catch (err) {
    logerror('[handleLogout]', err)
    // throw new Error('[handleLogout] Error')
    return false
  }
}
























export const handleSignup = async (event, data) => {
  console.log('handling signup', data)
  event.preventDefault()

  try {
    if(process && process.browser === true) {
      // const response = await fetch(
      // `/api/passport/signup`, {
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   method: 'POST',
      //   body: JSON.stringify(data)
      // })

      const user = await fetch(`api/profile?userName=${data.userName}`).then(r => r.json())

      if(user && user.status) {
        return {
          status: false,
          message: 'Username unavailable'
        }
      }
      
      const response = await fetchPost('/api/passport/signup', data, fetch)

      if(response && response.status == 200) {
        const results = await response.json()
        logger('[handleSignup]', 'Signed up:', results)
        if(results.user) {
          User.set(results.user) // update the store object
          goto('/profile')
          return
        }

        return {
          status: false,
          message: 'Signup failed',
          data: results,
        }
      }
    }

  } catch (err) {
    // console.error(err)
    logerror('[handleSignup]', 'Error:', err)
    return
  }
}












export const handleForgot = async (event, data) => {
  event.preventDefault()

  try {
    // const response = await fetch(
    // `/api/passport/forgot`, {
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // })
    const response = await fetchPost('/api/passport/forgot', data, fetch)

    if(response.status == 200) {
      const _res = await response.json()
      return _res
    }

  } catch (err) {
    // console.error(err)
    logerror('[handleForgot]', 'Error:', err)
    return err
  }
}


export const handleResetPassword = async (event, data) => {
  event.preventDefault()

  try {
    // const response = await fetch(
    // `/api/passport/reset`, {
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // })
    const response = await fetchPost('/api/passport/reset', data, fetch)

    if(response.status == 200) {
      const _res = await response.json()
      return _res
    }

  } catch (err) {
    logerror('[handleResetPassword]', 'Error:', err)
    return err
  }
}
















/*

	Old login methods

*/





// export const signup = ({email, password, session}) => {

//   console.log('signing up....', email, password, JSON.stringify({ email, password }) )

//   try {
// 		return fetch(`api/auth/signup`, {
// 			method: 'POST',
// 	    headers: { 'Content-Type': 'application/json' },
// 	    body: JSON.stringify({ email, password }),
// 		}).then(async (response) => {
// 			console.log('response:', response)

// 			if(response.status === 409)
// 				return Promise.reject()

// 			let data = await response.json()

// 			if (data.user) {
// 				session.set({ user: data.user });
// 				return Promise.resolve()
// 			}
// 		})
//   } catch(err) {
//   	console.log('auth-helper signup error', err)
//   }
// }


// export const logout = (session) => {
// 	console.log('logging out ... ', session)
// 	return fetch(`api/logout`).then(response => {
// 		console.log('logged out:', response)
// 		session.set({ user: null });
// 		return Promise.resolve()
// 	})
// }




