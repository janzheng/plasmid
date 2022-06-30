

/*

  "reader" is either from browser or node FileReader
  - needs to be passed in so this fn can be more flexible

  ex: let reader = new FileReader();

*/

import * as Hash from 'ipfs-only-hash'
import { Buffer } from 'buffer'

export const dataHash = async (data) => {
  return await Hash.of(data)
}

export const getFileHash = async ({ file, reader = new FileReader() }) => {
  return new Promise((res, rej) => {
    reader.addEventListener("load", function () {

      let preview = reader.result
      const clean = preview.slice(preview.indexOf(",") + 1)
      const data = Buffer.from(clean, "base64")
      res(dataHash(data))
    }, false);
    reader.readAsDataURL(file)
  })
} 