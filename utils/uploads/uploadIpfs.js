
import { create, urlSource } from 'ipfs-http-client'


export const uploadFileToIpfs = async (_file, url = 'https://ipfs.infura.io:5001/api/v0') => {
    const ipfs = create(url)

  let file = await ipfs.add(_file)
    let cid_str = file.cid.toString()
    file['cid_str'] = cid_str
    file['ipfs'] = 'https://ipfs.io/ipfs/' + cid_str
    file['cloudflare'] = 'https://cloudflare-ipfs.com/ipfs/' + cid_str
    return file
  }