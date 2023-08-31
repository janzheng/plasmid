// import { mapKeys } from '../transformers/index.js'
import * as jsonlines from 'jsonlines';

// import fs only on regular node
let fs;
// Check if running in Cloudflare Workers
const isCloudflareEnv = typeof globalThis.fetch === 'function';
if (!isCloudflareEnv) {
  import('fs/promises')
    .then((module) => {
      fs = module;
    })
    .catch((err) => {
      console.error('Failed to import fs/promises:', err);
    });
}



import { applyTransformers } from '../transformers/index.js'

async function readFileAsString(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return data;
}



export const jsonLoader = async (src, type="json") => {
  let results
  if(type == "json") {
    // results = await import(src.inputs.path, {assert: { type: 'json' }} /* @vite-ignore */)
    // results = await import(src.inputs.path /* @vite-ignore */)
    results = await readFileAsString(src.inputs.path);
    results = applyTransformers(results, src.transformers)
    return results
  }

  else if (type == "jsonlines") {
    return new Promise(async (resolve, reject) => {
      const parser = jsonlines.parse()
      results = []
      // let dataStr = await import(src.inputs.path /* @vite-ignore */)
      let dataStr = await readFileAsString(src.inputs.path);

      parser.on('data', function (data) {
        results = [...results, data]
      })

      parser.on('end', function () {
        // results = applyTransformers(results, src.transformers)
        let transformed = applyTransformers(results, src.transformers)
        resolve(transformed)
      })
      parser.write(dataStr)
      parser.end()
    })
  }

}
