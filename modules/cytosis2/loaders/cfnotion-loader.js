
/* 

  Turns a Notion Collection into an array. For collections > posts

    {
      "name": "site-data",
      "type": "cfnotion",
      "path": "/collection/cccaab5d7ee04ebd9a42dbf2227c1cdb",
      // "url": "https://notion-cloudflare-worker.yawnxyz.workers.dev",
      // in-place transformation config
      // "transformer": {
      //   "remap": {
      //     "Name": "Fruit"
      //   },
      //   "objectKey": "Fruit", // --> use the new remapped name as the object key
      // },
      // array-based transformation config
      "transformers": [
        {
          "function": "transformArrayToObjectByKey",
          "settings": {
            "objectKey": "Name"
          }
        },
        {
          "function": "transformRemap",
          "settings": {
            "oneKeyDeep": true, // required when given an object w/ named keys like Airtable or ArrayToObject { key1: { ...data }}
            "remap": {
              "Name": "Fruit",
            }
          }
        },
      ]
    },

    {
      "name": "jz-posts",
      "type": "cfnotion",
      "path": "/collection/c94e18d29ab54bdc8318d6a41f683e92",
      // "url": "https://notion-cloudflare-worker.yawnxyz.workers.dev",
      "loaders": {
        "notionPageId": "id" // loads the page data as well; this takes a lot of time + memory
      },
      // "transformers": [
      //   {
      //     "function": "transformRemap",
      //     "settings": {
      //       "remap": {
      //         "Description": "Lede"
      //       }
      //     }
      //   },
      // ]
    },

*/

if (typeof fetch === 'undefined') {
  import('node-fetch').then(module => fetch = module.default);
}

import { cfnotionPagesLoader, cfnotionPagesLoaderWorker } from './cfnotion-pages-loader.js'
import { applyTransformers } from '../transformers/index.js'
// import { mapKeys } from '../transformers/helpers.js'

const getPageBlockValues = (page) => {
  // pages data wrapped in {id: id.value}, and we want to just get the value itself
  return Object.values(page).map((el) => el.value);
}


export const cfnotionLoader = async (src) => {
  let cfNotionUrl = src.url || "https://notion-cloudflare-worker.yawnxyz.workers.dev"
  let url = `${cfNotionUrl}/v1/${src.path}`
  try {
    let obj={}, arr=[]
    
    // if path, return the object
    if (src.path) {
      const response = await fetch(url);
      let results = await response.json();


      console.log('000 RESULTS 0:', Buffer.byteLength(JSON.stringify(results), 'utf8'))


      // transform the data before returning
      results = getNotionDataList(results, src)
      
      console.log('111 RESULTS 1:', Buffer.byteLength(JSON.stringify(results), 'utf8'))

      results = await loadPages(results, src)

      console.log('222 RESULTS 2:', Buffer.byteLength(JSON.stringify(results), 'utf8'))

      // call transformers one by one
      // results = transformRemap(results, src.transformer)
      // results = transformArrayToObjectByKey(results, src.transformer)
      // call transformers using an array model
      results = applyTransformers(results, src.transformers)
  
      return results
    }
    return null
  } catch(e) {
    console.error('[cfnotionLoader] Error while fetching:', url, " | Error:", e)
  }
}


// only get the rows from the data; the rest is too big
// better if you could specify the source to only send the rows
export const getNotionDataList = (data, src) => {
  let results
  // if data is an object we just want the rows
  if(data && data.rows) {
    results = data.rows
  }

  return results
}



// adds pageBlocks (loads the page content) for each page in the collection
// this can be really slow for large collections
const loadPages = async (rows, src) => {
  let arr = rows
  if (src.loaders?.notionPageId) {
    let pages = await Promise.all(rows.map((row) => {
      return cfnotionPagesLoader({
        "name": "pageBlocks",
        "type": "cfnotion-pages",
        "path": `/page/${row[src.loaders?.notionPageId]}`,
      })
    }))
    pages.map((page, i) => {
      arr[i]['pageBlocks'] = getPageBlockValues(page)
    })
  }
  return arr
}









/* 

  These are for Cloudflare Workers only; will fail in Node

*/
export const cfnotionLoaderWorker = async (src) => {
  // meant only for CF worker bindings
  if (typeof NOTIONCFWORKER === 'undefined') {
    return
  }

  let cfNotionUrl = src.url || "https://notion-cloudflare-worker.yawnxyz.workers.dev"
  let url = `${cfNotionUrl}/v1/${src.path}`
  // let url = `/v1/${src.path}`
  try {
    let obj = {}, arr = []
    if (src.path) {
      const request = new Request(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const response = await NOTIONCFWORKER.fetch(request);
      let results = await response.json();
      console.log('CFNOTION RESULTS:::', results)
      results = getNotionDataList(results, src)
      results = await loadPagesWorker(results, src)
      results = applyTransformers(results, src.transformers)

      return results
    }
    return null
  } catch (e) {
    console.error('[cfnotionLoader] Error while fetching:', url, " | Error:", e)
  }
}

const loadPagesWorker = async (rows, src) => {
  let arr = rows
  if (src.loaders?.notionPageId) {
    let pages = await Promise.all(rows.map((row) => {
      return cfnotionPagesLoaderWorker({
        "name": "pageBlocks",
        "type": "cfnotion-pages",
        "path": `/page/${row[src.loaders?.notionPageId]}`,
      })
    }))
    pages.map((page, i) => {
      arr[i]['pageBlocks'] = getPageBlockValues(page)
    })
  }
  return arr
}


