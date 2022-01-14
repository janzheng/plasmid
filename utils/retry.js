/* 7/8/2021

  Simple wrapper for async retry

  Usage:
    
    let _cytosis = await retry(async () => {
      return await new Cytosis({
        apiKey: apiEditorKey,
        baseId: baseId,
        bases: 	bases,
        routeDetails: '[content/get]',
      })
    })



    let blah = await retry(async () => {
      const res = await fetch('https://asdasdasdads.com')
    
      if (403 === res.status) {
        // don't retry upon 403
        bail(new Error('Unauthorized'))
        return
      }
    
      const data = await res.text()
      return data.substr(0, 500)
    })
    console.log('blah?', blah)


*/
import Retry from "async-retry"



export const retry = (fn, retries=5, loud=false, msg='try #') => {
  let tries = 0
  return Retry(async bail => {
    // console.log('[retry] ', msg, ++tries)
    let result = await fn(bail)
    return result
  }, {
    retries: retries
  })
}

// retry example:
/* 

  let _cytosis = await Retry(async bail => {
    // console.log('loading cytosis...', bases)
    let _cytosis = await new Cytosis({
      apiKey: apiEditorKey,
      baseId: baseId,
      bases: 	bases,
      routeDetails: '[content/get]',
    })
    return _cytosis
  }, {
    retries: 5
  })


  */