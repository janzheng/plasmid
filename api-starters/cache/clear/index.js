


/*

  Documentation / Notes

  Cache API

  - GET api/cache/
    - gets a list of active cache keys

  - GET api/cache/clear
    - clears the entire cache (refreshes browser data)

  - GET api/cache/clear/{key}
    - clears cache at a key

*/



// import send from '@polka/send';
import { sendData } from "@/plasmid/utils/sapper-helpers" 
import { cacheGet, cacheSet, cacheClear, getCacheKeys } from "@/plasmid/utils/cache"

export async function get(req, res) {
  try {
    const { key } = req.params
    let _result = {status: cacheClear(key)}
    return sendData(_result, res)
  } catch(e) {
    console.error('[api/cache/clear]', e)
    send(res, 500, JSON.stringify(e));
  }
}


