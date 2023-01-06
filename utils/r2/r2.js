
// use on server only
/* 

  this token is manually generated and is a secret across the
  R2 worker (pd-apps) and in the Vercel deployment

  - eventually use tokens once the feature is rolled out
  
  1. request temporary token from Worker (short TTL)
  2. sent it to client (if authorized)
  3. upload with token
  4. token expires

*/

import { PUBLIC_PDR2_AUTH, PUBLIC_PDR2_ENDPOINT, PUBLIC_PDR2_SCOPE } from '$env/static/public';

// better to get from session instead
// server-side: reveal deta key to endpoints
// ok to send this to client
export const getToken = () => {
  return process.env['PDR2_AUTH']
}






export const uploadFileToR2 = async (file, statusStore, filename=file?.name) => {
  try {

    if (!file) {
      statusStore?.update(store => ({
        ...store,
        message: "Maybe you forgot to choose a file first?"
      }))
    }

    // move file to Airtable using /deta/airtable endpoint
    // message = `Uploading ${files[0].name} ...`
    statusStore?.update(store => ({
      ...store,
      message: `Uploading ${filename} ...`
    }))

    let uploadUrl = `${PUBLIC_PDR2_ENDPOINT}/${PUBLIC_PDR2_SCOPE}/${filename}`
    if (!PUBLIC_PDR2_SCOPE) {
      url = `${PUBLIC_PDR2_ENDPOINT}/${filename}`
    }

    const res = await fetch(
      uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'X-Custom-Auth-Key': PUBLIC_PDR2_AUTH
      },
    })

    if (res.ok) {
      let resText, resJson
      try {
        resJson = await res.json()
      } catch(e) {
        // not json, so try text
        resText = await res.text()
      }
      if (resJson) {
        // uses filofax PUT response
        filename = resJson?.key
      }

      console.log('Uploaded!:', resText||resJson, 'link:', PUBLIC_PDR2_ENDPOINT + '/' + filename)
      const link = PUBLIC_PDR2_ENDPOINT + '/' + filename

      let obj = {
        success: true,
        result: resText,
        filename: filename,
        endpoint: PUBLIC_PDR2_ENDPOINT,
        url: link,
        message: `Uploaded: <a href="${link}">${link}</a>`,
      }

      statusStore?.update(store => ({
        ...store,
        ...obj
      }))
      return obj
    } else {

      statusStore?.update(store => ({
        ...store,
        success: false,
        message: `Error: ${res.status}`
      }))

      return {
        success: false,
        message: `Error: ${res.status}`
      }
    }
  } catch (err) {
  }
}





