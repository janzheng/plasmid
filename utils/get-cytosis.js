

// DEPRECATED!
// Use airfetch/getTable, checkExistence, or getTables


import Cytosis from 'cytosis';
import { cacheGet, cacheSet, cacheClear } from "./cache"


// simple helper — this is called a lot
export const getCytosis = async ({useCache=false, view, apiEditorKey, baseId, tableName='Content'}) => {
	try {
    let json;
    
		const _cacheStr = `getCytosis-${tableName}`
		let _cache = cacheGet(_cacheStr)
		if(useCache && _cache) {
			return _cache
		}

		view = view || process.env.STATUS=='Preview' ? "Preview" : "Published"
		apiEditorKey = apiEditorKey || process.env.PDV4_PUBLIC_API
		baseId = baseId || 'appnXWvimsp6J1H3f' // content

	  let bases = [{
		  tables: [tableName],
		  options: {
		    "view": view,
		  }
	  }
	  ]

	  let _cytosis = await new Cytosis({
	    apiKey: apiEditorKey,
	    baseId: baseId,
	    bases: 	bases,
	    routeDetails: '[getContent]',
	  })

	  delete _cytosis.apiKey
    delete _cytosis.baseId
    
		cacheSet(_cacheStr, _cytosis)

	  return _cytosis

	} catch(e) {
		console.error('[getCytosis] error:', e)
	}
}

