
// logs into fauna
import { config } from "dotenv";
import { cacheGet, cacheSet, cacheClear } from "@/plasmid/utils/cache"
import { sendData } from "@/plasmid/utils/sapper-helpers" 

config(); // https://github.com/sveltejs/sapper/issues/122

export const get = async (req, res, next) => {

	const { cacheslug, type } = req.params

	try {
		if(type==='base')
			cacheClear(`_base-${cacheslug}`)

	  return sendData({status: true}, res, 200)
  } catch(err) {
			console.error('api/cache', err)
			throw new Error(err)
  }
}





