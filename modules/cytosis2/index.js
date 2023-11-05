/* 

  Cytosis 2 - data loaders + transformers

  Basic cytosis flow is:
  (1) load a bunch of data from sources
  (2) transform that data in diferent ways
  (3) output or return the data

  We don't want to make Cytosis more complicated, but we can separat the loaders + transformers
  and add them to an FSM or other tool. Cytosis on its own is useful for specific loader/transformer tasks like blog and other data loading tasks.

  - todo notes
    - be able to pass in all loaders and transformer fns // make them available in the config - so we don't need a separate cf version (since some can't be loaded on CF)




*/



import { dataLoader } from './loaders/data-loader.js'
import { cfnotionLoader } from './loaders/cfnotion-loader.js'
import { cfnotionPagesLoader } from './loaders/cfnotion-pages-loader.js'
import { gsheetLoader } from './loaders/gsheet-loader.js'
import { airfetchLoader } from './loaders/airfetch-loader.js'
import { apiLoader } from './loaders/api-loader.js'

// node-only imports
// import { notionLoader } from './loaders/notion-loader.js'
// import { jsonLoader } from './loaders/json-loader.js'
// import { csvLoader } from './loaders/csv-loader.js'
// import { linksLoader } from './loaders/links-loader.js'

import { applyTransformers, addTransformers } from './transformers/index.js'

export const loud = false


export const endo = async (config, {
  sourceNames, // = ['site-data'],
  transformers,
} = {} ) => {
  if(loud)
    console.log('[endo] Init load ---------',)

  let sources = [...config?.sources] // prevents issues when running multiple endos

  if (sourceNames && sourceNames.length>0) {
    sources = sources.filter(src => sourceNames.includes(src.name))
  }

  let sourceFile = config?.loaders?.sourceFile || (typeof process !== 'undefined' ? process.env.CY_SOURCEFILE : undefined)
  if (sourceFile) {
    try {
      let data = await import(sourceFile /* @vite-ignore */) 
      if (data && data.default) {
        if (loud)
          console.log('[endo] Using build file: ', sourceFile)
        return data.default
      }
    } catch(e) {
      console.log('[endo] File does not exist; loading from APIs.')
    }
  } else {
    if (loud)
      console.log('[endo] Using API Loaders: ', sourceFile)
  }

  // add new transformers into the transformerMap
  if (transformers && Array.isArray(transformers) && transformers.length > 0) {
    addTransformers(transformers)
  }

  if (loud)
    console.log('[endo] Fetching data sources:', sources)
  // let loaderData = [] // for storing recursive, nested async data
  let sourceData = await Promise.all(sources.map((src, i) => {

    if(loud)
      console.log('[endo] >> loading item:', src.name, src.type)
    // cytosis2 versions
    // get notion from cloudflare-notion endpoint
    let asyncData
    if (src.type == 'data') {
      asyncData = dataLoader(src)
    }
    if (src.type == 'cfnotion') {
      asyncData = cfnotionLoader(src)
    }
    if (src.type == 'cfnotion-pages') {
      asyncData = cfnotionPagesLoader(src)
    }
    if (src.type == 'airfetch') {
      asyncData = airfetchLoader(src)
    }
    if (src.type == 'gsheet') {
      asyncData = gsheetLoader(src)
    }

    // untested / WIP
    if (src.type == 'notion') {
      asyncData = notionLoader(src)
    }
    if (src.type == 'json') {
      asyncData = jsonLoader(src)
    }
    if (src.type == 'jsonlines') {
      asyncData = jsonLoader(src, "jsonlines")
    }
    if (src.type == 'csv') {
      asyncData = csvLoader(src)
    }
    if (src.type == 'api') {
      asyncData = apiLoader(src)
    }
    if (src.type == 'links') {
      asyncData = linksLoader(src)
    }

    // future: support nested data
    // if (src.loader) {
    //   let endoData
    //   (async () => {
    //     endoData = await endo(src.loader, {
    //       sourceNames, // = ['site-data'],
    //       transformers,
    //     })
    //     console.log('asyncfn endoData:', endoData)
    //   })()
      
    //   console.log('^^^^^^^^^^ endoData:', endoData)
    //   if(Array.isArray(asyncData)) {
    //     asyncData.push(endoData)
    //   } else {
    //     asyncData['loader'] = endoData
    //   }
    // }

    return asyncData
  }))

  let data = {}

  if (loud)
    console.log('[endo] Done fetching!')



  // set the base transformer if not set in config
  if(!config.transformers) {
    config.transformers = [{"function": "outputObject"}]
  }
  data = applyTransformers(sourceData, config.transformers, sources)
  return data
}



// basic wrap around the Cloudflare Worker endocytosis loader
// todo: implement sourceNames and transformers
export const endoloader = async (config, {
  url,
  key, // optional fuzzykey cache key
  // sourceNames, // = ['site-data'],
  // transformers,
  saveCache,
  loud = false
} = {}) => {
  try {
    if(loud) console.log('[endoloader] loading:', url, key, config)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, config, saveCache })
    });
    
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let result = await response.json();
    // console.log('endoloader result:', result, url, JSON.stringify({ key, config }, 0, 2));
    // return result?.value || result
    // return the original response from endoloader, otherwise wrapping in endocache causes a problem where the same key either stores the wrappd respone OR just the value, causing lots of "fun"
    if (loud) console.log('[endoloader] result: ', key, result)
    return result
  } catch (error) {
    console.error('[endoloader] error:', error);
  }
}