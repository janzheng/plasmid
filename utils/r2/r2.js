
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

    // let uploadUrl = `${PUBLIC_PDR2_ENDPOINT}/${PUBLIC_PDR2_SCOPE}/${filename}`
    // if (!PUBLIC_PDR2_SCOPE) {
    //   url = `${PUBLIC_PDR2_ENDPOINT}/${filename}`
    // }

    // THIS REQUIRES THE FILOFAX ENDPOINT AT f2.phage.directory!
    let uploadUrl = `${PUBLIC_PDR2_ENDPOINT}`
    let formData = new FormData(); // File to upload. 
    let scope = PUBLIC_PDR2_SCOPE
    formData.append('files', file, filename); 
    // formData.append('versioning', 'false'); 
    formData.append('scope', scope); 

    console.log('uploadUrl:', uploadUrl)
    let res
    try {
      res = await fetch(
        uploadUrl, {
        method: 'POST',
        body: formData,
        // body: file,
        headers: {
          'X-Custom-Auth-Key': PUBLIC_PDR2_AUTH
        },
      })
    } catch (err) {
      console.error('[Upload failed]', err)
    }

    // console.log('uploadres:', res, res.ok)

    if (res?.ok) {
      let  resJson
      try {
        resJson = await res.json()
        console.log('resJson', resJson)
      } catch(e) {
        console.log('error parsing json', e)
      }
      if (resJson) {
        // uses filofax PUT response
        filename = resJson?.key
      }

      // const link = PUBLIC_PDR2_ENDPOINT + '/' + filename
      const link = resJson?.[0].permalink
      console.log('Uploaded!:', resJson, 'link:', PUBLIC_PDR2_ENDPOINT + '/' + filename)

      let obj = {
        success: true,
        result: resJson,
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

      console.error('[Upload failed]', res.message)

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
    console.error('[Upload failed]', err)
  }
}





