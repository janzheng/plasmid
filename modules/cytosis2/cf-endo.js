
// SPECIAL FILE THAT EXCLUDES SOME LOADERS

import { dataLoader } from './loaders/data-loader.js'
import { cfnotionLoaderWorker as cfnotionLoader } from './loaders/cfnotion-loader.js'
import { cfnotionPagesLoaderWorker as cfnotionPagesLoader } from './loaders/cfnotion-pages-loader.js'
import { gsheetLoader } from './loaders/gsheet-loader.js'
import { airfetchLoaderWorker as airfetchLoader } from './loaders/airfetch-loader.js'
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
} = {}, request) => {
  if (loud)
    console.log('[endo] Init load ---------',)

  let sources = [...config?.sources] // prevents issues when running multiple endos

  if (sourceNames && sourceNames.length > 0) {
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
    } catch (e) {
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

    if (loud)
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
      asyncData = airfetchLoader(src, request)
    }
    if (src.type == 'gsheet') {
      asyncData = gsheetLoader(src)
    }

    // untested / WIP
    // if (src.type == 'notion') {
    //   asyncData = notionLoader(src)
    // }
    // if (src.type == 'json') {
    //   asyncData = jsonLoader(src)
    // }
    // if (src.type == 'jsonlines') {
    //   asyncData = jsonLoader(src, "jsonlines")
    // }
    if (src.type == 'csv') {
      asyncData = csvLoader(src)
    }
    if (src.type == 'api') {
      asyncData = apiLoader(src)
    }
    // if (src.type == 'links') {
    //   asyncData = linksLoader(src)
    // }

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
  if (!config.transformers) {
    config.transformers = [{ "function": "outputObject" }]
  }
  data = applyTransformers(sourceData, config.transformers, sources)
  return data
}