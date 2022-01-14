

/*

	Helper. Used by front-end to grab a public profile.
  - Profile returned as a sapper store object

	Last updated: 9/23/2020
	
*/


import { logger, logerror } from '../logger';
import { cachet } from '../sapper-helpers';

export const getProfile = (_phid, fetch, swr=true, refresh=false) => {
  try {
    // fetch is passed from the browser
    if(fetch) {
      const profileStore = cachet({
        key: `profile-${_phid}`,
        promise: () => (fetch(`api/profile?_phid=${_phid}`)
          .then(response => (
            response.json().then(json => (
              json.data
            )))
        )),
        swr: true,
        refresh: false,
      })

      return profileStore
    }

    return null

    // const response = await fetch(`api/profile?_phid=${_phid}`)
    // if(response.status == 200) {
    //   const results = await response.json()
    //   if(results) 
    //     return results
    // } else {
    //   // error = err
    //   logger('[get-profile]', 'error:', results)
    // }
  } catch (err) {
    console.error(err)
    logerror('[get-profile]', 'Error:', err)
  }

  return undefined
}


