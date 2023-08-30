/* 

  Wrapper + Utility for cache.js and fuzzyface.js


  Utility for easily checking + returning a value if key exists in cache,
  otherwise running the function to get the value
  auto sets the value itself into the key if it doesn't exist


  import { cachet } from '$plasmid/utils/cachet'

  // setting cachet w/ a function
  // this will overwrite the cached value!
  await cachet('testkey', ()=>{
    return "woof woof?!!!!"
  }, {skip: false})

  // just get the value itself
  console.log("cachet!!!", await cachet('banana/rama'))

*/

export let loud = false;


import { PUBLIC_FUZZYKEY_URL } from '$env/static/public';
import FuzzyKey from '$plasmid/utils/fuzzykey'
import { cacheSet, cacheGet } from "./cache.js"

let fuzzy = FuzzyKey({ url: PUBLIC_FUZZYKEY_URL }) || null

async function _get(key, metadata=false) {
  // in-memory cache is short, but fast
  let value = cacheGet(key, metadata)
  if(value) return value

  // if not in-memory cache, we check fuzzykey cache
  if(fuzzy) {
    value = await fuzzy.get(key)
    if(metadata == false) {
      value = value.data
    }
  }
  
  return value
}

// set both fuzzyKey (Worker KV if it exists) and in-memory cache
async function _set(key, value, ttl = 60 * 60) {
  if(fuzzy)
    await fuzzy.set(key, value, null, ttl)
  return cacheSet(key, value, ttl)
}


/**
 * Pass-through cache function with optional get and set functions.
 * If you give a dynamicFunction, it'll prefer to run it / set the value if not in cache.
 * use skip=true to skip the dynamic function
 * @param {string} key - The cache key.
 * @param {function} dynamicFunction - The dynamic function to execute if key is not in cache.
 * @param {function} [get] - Optional function to retrieve the value from the cache.
 * @param {function} [set] - Optional function to set the value in the cache.
 * @returns {*} - The value from cache or from the executed dynamic function.
 */
export const cachet = async (key, dynamicFunction, {skip=false, metadata=false, ttl=60*60, get, set} = { get: null, set: null }) => {

  // Use optional get function or default behavior
  let getFunc = get || (async (key, metadata) => await _get(key, metadata));
  let setFunc = set || (async (key, value, ttl) => await _set(key, value, ttl));

  let value = await getFunc(key, metadata);

  // if (skip), we always run the dynamic function
  // Check if the key exists in the cache
  if (skip==false && value) {
    if(loud)
      console.log('[cachet] Fetching from cache:', key, value);
    return value;
  }

  if (dynamicFunction) {
    // If the key doesn't exist, run the dynamic function
    if(loud)
      console.log('[cachet] Calculating value:', key);
    value = await dynamicFunction();
  
    // Use optional set function or default behavior to store the result in the cache
    await setFunc(key, value, ttl);
  
    return value;
  }

  return null; // nothing to return
};