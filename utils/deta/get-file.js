
// use this enpoint to serve a file from deta
// this DOES work with Airtable
// example: /uploads/filename.jpg

import { getDrive } from './deta';
import { fileTypeFromBuffer } from 'file-type'

// 
// Server-side Examples
// 

export const getFileData = async (name) => {

  const file = await getDrive().get(name);
  const fileArrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileArrayBuffer)
  const type = await fileTypeFromBuffer(buffer)

  // console.log('type::', type)
  return {
    file,
    fileArrayBuffer,
    buffer,
    type,
  }
}




// use this for endpoints by setting get equal to _get
// GET /deta
export const getFile = async (request) => {

  const name = request.params.name; //request.url.searchParams.get('name');
  let data = await getFileData(name)

  return {
    body: data.buffer,
    headers: {
      'Content-Type': data.type.mime, // uncommenting headers makes Chrome show it
      // 'Content-Disposition': `attachment; filename="${file.name}"`, // downloads
      'Content-Disposition': `inline`, // shows in browser
    }
  };
};
