

// upload to airtable thru deta
// post file to deta > upload to airtable > delete from deta

import { Deta } from 'deta'
import { config } from "dotenv"
import { fileTypeFromBuffer } from 'file-type'

import { addRecord } from "./airfetch.js"

config(); // https://github.com/sveltejs/sapper/issues/122

// add your Project Key
export const _deta = Deta(process.env['DETA_KEY']);
export const drive = _deta.Drive("tmpImages");



// file is from form data
// note: naming this function "upload" will disable it on vercel...
/* 

  usage example in the post() 

*/
export const handleFile = async (file, originUrl, tableName, fieldName = 'Attachments') => {
  const buffer = await file.arrayBuffer();
  const uintarr = new Uint8Array(buffer)

  // upload file
  let fileref = await drive.put(file.name, {
    data: uintarr,
  })

  const record = await addRecord(
    tableName,
    { [fieldName]: [{ url: `${originUrl}/deta/airtable/${fileref}` }], },
    null,
    { insertOptions: ['typecast'], },
  )

  return record
}



// this needs to be placed in a .js file under /route/ in svelteKit
// export const post = async ({ request, url }) => {
//   const form = await request.formData(); // or .json(), or .text(), etc
//   const file = form.get('file')
//   upload(file, url.origin, Test, )

//   return {
//     body: {
//       result: record
//     },
//   };
// };



export const getFile = async(name) => {
  const file = await drive.get(name);
  const fileArrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileArrayBuffer)
  const type = await fileTypeFromBuffer(buffer)

  return {
    body: buffer,
    headers: {
      'Content-Type': type.mime, // uncommenting headers makes Chrome show it
      // 'Content-Disposition': `attachment; filename="${file.name}"`, // downloads
      'Content-Disposition': `inline`, // shows in browser
    }
  };
}

// garbage collection function?
// delete the file from deta once it's uploaded
// since uploading is async this needs to wait! Otherwise the upload won't go through
// if(record) {
//   await drive.delete(fileref)
// }






// 
//  API functions
// 

/*  
  - takes a formdata post request and adds it to deta

  paste this as airtable/index.js:

  import { postFileRequest } from '@plasmid/utils/airfetch-upload'
  export const post = postFileRequest // sveltekit post api
*/

export const postFileRequest = async ({ request, url }) => {
  let record

  const form = await request.formData(); // or .json(), or .text(), etc
  const file = form.get('file')

  if (file) {
    record = await handleFile(file, url.origin, 'Test')
  }

  return {
    body: {
      result: record
    },
  };
};



/* 

  paste this into:
    - api/airtable/[name].js

  this is for getting the file from deta, based on filename, to be sent as a link to airtable

  import { getFileName } from '@plasmid/utils/airfetch-upload';
  export const get = getFileName

*/

export const getFileName = async (request) => {
  let ret = await getFile(request.params.name)
  return ret
}




