

import { getCommentCounts } from './_comments'
import { sendData } from "../../../_utils/sapper-helpers" 
import { cacheGet, cacheSet, cacheClear } from "../../../_utils/cache"


export const getCounts = async (locIds) => {
	const _cacheStr = `comment-counts` // comment counts for fave grid — this gets long
	const _cacheObj = cacheGet(_cacheStr, false)
	if (typeof _cacheObj === 'number') {
		return _cacheObj
	}

	const count = await getCommentCounts(locIds)
	cacheSet(_cacheStr, count, 60*60, false) // short cache to save fauna pings
	return count
}


export async function get(req, res, next) {

	const { locId, locIds, } = req.query
	try {

		let count
		if(locId) {
			count = getCount(locId) // returns a number
		} else if (locIds) { // this breaks on too many queries lol
			// returns an object of each locId as key, and respective counts
			count = {}
			let _counts = locIds.split(',').map(async (loc) => {
				const _count = await getCount(loc)
				count[loc] = _count
			})
			await Promise.all(_counts)
		}

		return sendData(count, res)

	} catch(e) {
		console.error('[api/comments/count] error:', e)
	}
}







export async function post(req, res, next) {

	const { locIds } = req.body
	try {

		let count = {}

		if (locIds) {
			// returns an object of each locId as key, and respective counts
			count = {}
			// let _counts = locIds.split(',').map(async (loc) => {
			// 	const _count = await getCount(loc)
			// 	count[loc] = _count
			// })
			// await Promise.all(_counts)
			count = await getCounts(locIds)
			// console.log(' Counts ?!?!?!?!?!?!!?!?!', count)
		}

		return sendData(count, res)

	} catch(e) {
		console.error('[api/comments/count] error:', e)
	}
}