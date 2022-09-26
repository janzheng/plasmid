
import { create, urlSource } from 'ipfs-http-client'


// Infura's been shut down (July 2022)
// export const uploadFileToIpfs = async (_file, url = 'https://ipfs.infura.io:5001/api/v0') => {
//     const ipfs = create(url)

//   let file = await ipfs.add(_file)
//   let cid_str = file.cid.toString()
//   file['cid_str'] = cid_str
//   file['ipfs'] = 'https://ipfs.io/ipfs/' + cid_str
//   file['cloudflare'] = 'https://cloudflare-ipfs.com/ipfs/' + cid_str
//   return file
// }


// uploads to estuary
// make SERVER-SIDE to prevent exposing API key
// estuary sems broken! Sep 1 2022
import { env } from '$env/dynamic/private';

export const uploadFileToIpfs = async (formData) => {
  // console.log('trying to upload to estuary ...', env['ESTUARY_API'])
  // // const ipfs = create(url)

  // // let file = await ipfs.add(_file)
  // // let cid_str = file.cid.toString()
  // // file['cid_str'] = cid_str
  // // file['ipfs'] = 'https://ipfs.io/ipfs/' + cid_str
  // // file['cloudflare'] = 'https://cloudflare-ipfs.com/ipfs/' + cid_str
  // // return file

  // let res = await fetch('https://shuttle-5.estuary.tech/content/add', {
  // // let res = await fetch('https://api.estuary.tech/content/add', {
  //   method: "POST",
  //   headers: {
  //     'Authorization': `Bearer ${env['ESTUARY_API']}`,
  //     'Content-Type': `multipart/form-data`,
  //   },
  //   body: formData
  // })
  // console.log('-->', env['ESTUARY_API'], res)
  // return res
}