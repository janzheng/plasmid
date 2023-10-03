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


  // using cachet and fuzzy:
  // // let add = await fuzzy.set("banana/rama", {fruit:"bannnnanana!!"})
  // let fzz = await fuzzy.get("banana/rama")
  // console.log("fuzzy get:", fzz.data)
  // setting cachet w/ a function
  // let myvar = "ok I can't believe this works lol"
  // await cachet('testkey', ()=>{
  //   console.log('myvar...', myvar)
  //   return myvar
  // }, {skip: true})
  // console.log("cachet testkey!!!", await cachet('testkey'))
  // console.log("cachet!!!", await cachet('banana/rama'))
  // let fuzzytest = await fuzzy.get("testkey")
  // console.log("fuzzytest", fuzzytest.data)

*/

export let loud = true;


import { PUBLIC_FUZZYKEY_URL } from '$env/static/public';
import FuzzyKey from '$plasmid/utils/fuzzykey'
import { cacheSet, cacheGet, cacheClear } from "./cache.js"

let fuzzy = FuzzyKey({ url: PUBLIC_FUZZYKEY_URL }) || null

async function _get(key, ttl) {
  // in-memory cache is short, but fast
  let created
  let value = cacheGet(key)

  // this causes a ton of caching problems; ONLY return the original wrapped response; downstream needs to handle ".value"
  // let finalValue = value?.data || value.value || value;
  let finalValue = value;

  if(loud) {
    console.log('[cachet/get] -----> key:', key)
    console.log('-----> [cachet/get][Local Cache?]:', key, typeof finalValue)
  }

  // if not in-memory cache, we check fuzzykey cache
  if (!finalValue && fuzzy) {
    finalValue = await fuzzy.get(key, true)
    if(loud) console.log('-----> [cachet/get][Fuzzy Cache]:', key, finalValue)
  }

  try {
    finalValue = JSON.parse(finalValue);
  } catch (error) {
    // Handle the error if finalValue is not a valid JSON object
    // do nothing! finalValue will remain a string
  }
  if(loud) console.log('-----> [cachet/get] cache metadata:', finalValue?.metadata)

  // return value?.data || value
  created = finalValue?.metadata?.created;
  // console.log('[cachet/get] final value :::>>', finalValue)

  cacheSet(key, finalValue, ttl) // set in-memory cache
  // return { payload: finalValue, created }
  return finalValue // preserve shape of cached item
}

// set both fuzzyKey (Worker KV if it exists) and in-memory cache
// default to 4-day long ttl
async function _set(key, value, ttl = 60 * 60 * 24 * 4, metadata, setFuzzy=true) {
  // console.log('----> [cachet/_set] -> setting data:', key, value)
  if(setFuzzy && key && fuzzy && value) {
    console.log('----> [setting fuzzy] cache:', key, value)
      await fuzzy.set(key, value, null, ttl, metadata)
  }
  return cacheSet(key, value, ttl)
}









/**
 * Pass-through cache function with optional get and set functions.
 * If you give a dynamicFunction, it'll prefer to run it / set the value if not in cache.
 * use skip=true to skip the cache and always run the dynamic function
 * 
 * ttr = time to refresh; if the cache is older than ttr, we'll refresh it (and have to wait for stuff to load)
 * bgFn = the function to run in the background if ttr is exceeded, e.g. a CF worker refreshing a cache; don't use async await here since it's supposed to be elsewhere / serverless
 * 
 * @param {string} key - The cache key.
 * @param {function} dynamicFn - The dynamic function to execute if key is not in cache.
 * @param {function} [get] - Optional function to retrieve the value from the cache.
 * @param {function} [set] - Optional function to set the value in the cache.
 * @returns {*} - The value from cache or from the executed dynamic function.
 */
export const cachet = async (key, dynamicFn, { skip: skipCache = false, setFuzzy, metadata, ttl, get, set, ttr=3600 * 6, bgFn=()=>{}}={}) => {  

  // Use optional get function or default behavior
  let getFunc = get || (async (key) => await _get(key, ttl));
  let setFunc = set || (async (key, value, ttl, metadata, setFuzzy) => await _set(key, value, ttl, metadata, setFuzzy));

  let cachePayload = await getFunc(key);
  
  // Check if the time difference between now and created is over "ttr" in seconds
  // ttr = "timeToRefresh", meaning if the cache is older than ttr, we'll refresh it by running the dynamic function
  let now = Date.now();
  let timeDifference = (now - new Date(cachePayload?.metadata?.created)) / 1000; // convert milliseconds to seconds

  if (loud) console.log('[cachet] timeDifference:', timeDifference, 'created:', cachePayload?.metadata?.created, 'ttr:', ttr, 'skipCache:', skipCache);


  // if cache is updating / saving too often, move this after key cache
  // but that means that KV might not get uploaded often unless serverless is shut off
  // run the background function at the end to prevent side effects
  // this is independent of cached data, and is to refresh the SWR Fuzzy KV cache
  if (timeDifference > ttr && bgFn) {
    if (loud)
      console.log(`[cachet] ttr exceeded (${timeDifference} ?> ${ttr}?); running background function:`, bgFn);
    bgFn();
    cacheClear(key); // clear the local key so we can get the new value
  } else {
    console.log(`[cachet] within ttr (${timeDifference} ?> ${ttr}?); not running background function:`, bgFn);
  }

  // return the cached value and don't run the dynamic function if:
  // - value exists, and that it's not just a {} empty js obj
  // - skip is false (we don't want to skip the cache)
  // Check if the key exists in the cache
  if ((skipCache == false) && cachePayload?.value && typeof cachePayload?.value === 'object' && Object.keys(cachePayload?.value).length > 0) {
    if(loud) {
      console.log('[cachet] Using cached value:', key, cachePayload);
      // console.log('[cachet] Using cached value:', key, JSON.stringify(value, 0, 2));
    }
    return cachePayload;
  }

  if (dynamicFn) {
    // If the key doesn't exist, run the dynamic function
    if(loud)
      console.log('[cachet] Retrieving New Data 🌎🌎🌎:', key);
    cachePayload = await dynamicFn();
  
    // Use optional set function or default behavior to store the result in the cache
    await setFunc(key, cachePayload, ttl, metadata, setFuzzy);
    return cachePayload;
  }

  return null; // nothing to return
};