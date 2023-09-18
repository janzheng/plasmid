
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
import { getFileHash } from '$plasmid/utils/uploads/fileHash';

// better to get from session instead
// server-side: reveal deta key to endpoints
// ok to send this to client
export const getToken = () => {
  return process.env['PDR2_AUTH']
}






export const uploadFileToR2 = async ({file, status: statusStore, filename, scope=PUBLIC_PDR2_SCOPE} ) => {
  try {

    if (!file) {
      statusStore?.update(store => ({
        ...store,
        status: 'error',
        message: "Please choose a file!"
      }))
      return null
    }

    // TODO:
    // handle folder / webkitdirectory here

    if(!filename)
      filename = file?.name || "filename"



    statusStore?.update(store => ({
      ...store,
      filename,
      status: 'uploading',
      message: `Uploading ${filename} ...`
    }))

    // THIS REQUIRES THE FILOFAX ENDPOINT AT f2.phage.directory!
    let uploadUrl = `${PUBLIC_PDR2_ENDPOINT}`
    let formData = new FormData(); // File to upload. 
    formData.append('files', file, filename); 
    // formData.append('versioning', 'false'); 
    formData.append('scope', scope); 

    // console.log('uploadUrl:', uploadUrl)
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
    let key 

    if (res?.ok) {
      let  resJson
      try {
        resJson = await res.json()
        // console.log('resJson', resJson)
      } catch(e) {
        console.log('error parsing json', e)
      }
      if (resJson) {
        // uses filofax PUT response
        key = resJson?.[0].key
      }

      // const link = PUBLIC_PDR2_ENDPOINT + '/' + filename
      const link = resJson?.[0].permalink
      // console.log('Uploaded!:', resJson, 'link:', PUBLIC_PDR2_ENDPOINT + '/' + filename)

      let obj = {
        success: true,
        status: 'success',
        results: resJson,
        filename: filename,
        key, 
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
        status: 'failed',
        message: `Error: ${res.status}`
      }))

      return {
        success: false,
        status: 'failed',
        message: `Error: ${res.status}`
      }
    }
  } catch (err) {
    console.error('[Upload failed]', err)
  }
}














export const requestPresignedUrl = async ({file, scope=PUBLIC_PDR2_SCOPE, filename=file?.name, expiresIn=3600}) => {
  try {
    let obj = {
      cmd: 'presigned',
      scope: scope,
      key: filename,
      expiresIn: expiresIn,
      ipfsHash: await getFileHash({file})
    }

    console.log('requestPresignedUrl:', obj)

    const response = await fetch(PUBLIC_PDR2_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Auth-Key': PUBLIC_PDR2_AUTH
      },
      body: JSON.stringify(obj)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // const presignedUrl = await response.text();
    const presignedUrlObject = await response.json();
    return presignedUrlObject;
  } catch (error) {
    console.error('[requestPresignedUrl] Failed to fetch presigned URL:', error);
    return null;
  }
}



export const uploadPresignedUrl = async (url, { file, filename=file?.name, metadata={} }) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        // 'Content-Type': 'image/jpeg', // R2 is good at evaluating this
        ...Object.entries(metadata).reduce((acc, [key, value]) => {
          acc[`x-amz-meta-${key}`] = value;
          return acc;
        }, {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true // always true from server
  } catch (error) {
    console.error('[uploadPresignedUrl] Failed to upload file:', error);
    return null;
  }
}




// this allows for super-large files, as it goes around CF Worker
export const uploadFileWithPresignedUrl = async ({file, scope, status: statusStore}) => {
  try {

    if (!file) {
      statusStore?.update(store => ({
        ...store,
        status: 'error',
        message: "Please choose a file!"
      }))
      return null
    }

    const presignedUrlObject = await requestPresignedUrl({ file, scope });
    console.log('[uploadFileWithPresignedUrl] Presigned URL:', presignedUrlObject);

    let filename = file.name
    statusStore?.update(store => ({
      ...store,
      filename,
      status: 'uploading',
      message: `Uploading ${filename} ...`
    }))



    let result = await uploadPresignedUrl(presignedUrlObject.url, { file });

    let link = presignedUrlObject.permalink;

    
    let obj = {
      success: result,
      status: 'success',
      results: presignedUrlObject,
      filename,
      key: presignedUrlObject.key,
      endpoint: PUBLIC_PDR2_ENDPOINT,
      url: link,
      message: `Uploaded: <a href="${link}">${link}</a>`,
    }
    statusStore?.update(store => ({
      ...store,
      ...obj
    }))
    return obj
    
  } catch (error) {
    console.error('[uploadFileWithPresignedUrl] Error:', error);
    return {
      success: false,
    }
  }
};
