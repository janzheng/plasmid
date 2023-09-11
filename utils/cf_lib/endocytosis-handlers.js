
import { corsHeaders } from './cors-handler.js'
import { endo } from '../../modules/cytosis2/cf-endo.js';

// FUTURE: Support Airfetch-like database adds / mutations
const loud = true;

// super simple hash for kv key gen
function getHash(config) {
  const str = JSON.stringify(config);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
  }
  return hash.toString();
}

export const postHandler = async (request) => {
  try {
    const body = await request.text();
    // keep the wait/buffer time short, <4, since caching should be done client side
    // this is speedier for testing
    // unlike endocache, the "ttr" value is for background loading; this does NOT load anything in the background (like SWR)
    // and just returns the cached value, so it's mainly for reducing API calls during high loads
    let { config, scope, key, metadata, ttl = 3600 * 8, waitTime = 4, saveCache = true } = JSON.parse(body)
    let namespaceKey
    
    // console.log('CONFIG:', config)
    // Check if the time difference between now and created is over "waitTime" in seconds
    // if the wait time is more than the age of the cached value, we return the cached value instead of hitting up expensive APIs
    let value
    let kvKey = key || getHash(config) 

    // if (!scope) scope = 'endocache'
    namespaceKey = `${scope ? scope + '/' : ''}${kvKey || ''}`

    // console.log('[namespaceKey]:', namespaceKey)

    let kvData = await FUZZYKEY.getWithMetadata(namespaceKey)
    let now = Date.now();
    let created = kvData?.metadata?.created
    let timeDifference = (now - new Date(created)) / 1000; // convert milliseconds to seconds


    if (loud) console.log('[endocachet] waitTime:', waitTime, ' timeDiff:', timeDifference, 'key:', namespaceKey);
    if (created && timeDifference < waitTime) {
      // this is mainly to slow down requests
      if (loud) console.log('[endocachet] under wait time; returning cached value; wait:', waitTime, ' timeDiff:', timeDifference);
      value = kvData
    }

    if (!config) {
      return new Response(JSON.stringify(`POST needs a config`), {
        headers: corsHeaders
      });
    }

    if(!value) {// if we're pulling a KV value, get it from the endo request
      value = await endo(config, {mode: 'cloudflare'}, request)
      if (!metadata) {metadata = {}}
      metadata['created'] = Date.now()

      if (loud) console.log('[endocachet] new value loaded @', namespaceKey, 'cache?', saveCache);

      if (saveCache && (value?.value || value)) {
        if (loud) console.log('[endocachet] caching values to:', namespaceKey, 'data:', value);
        // value = value?.value || value // unwrapping the value from the metadata
        await FUZZYKEY.put(namespaceKey, JSON.stringify(value?.value || value), {
          metadata: { ...metadata, ttl },
        });

        // if (loud) console.log('[endocachet] cached value is:', await FUZZYKEY.get(namespaceKey));

      }
    }

    return new Response(JSON.stringify({
      status: true,
      key: namespaceKey,
      value,
      metadata,
    }), {
      headers: corsHeaders
    })
  } catch (e) {
    console.error('[postHandler]', e)
    return new Response(JSON.stringify(`Something went wrong with your request`), {
      headers: corsHeaders
    });
  }
}




// export const deleteHandler = async (request) => {
//   try {
//     const url = new URL(request.url);
//     const params = new URLSearchParams(url.search);
//     const scope = params.get('scope');
//     const key = params.get('key');

//     let namespaceKey = `${scope ? scope + '/' : ''}${key || ''}`

//     if (!key) {
//       return new Response(JSON.stringify(`DELETE needs a key`));
//     }

//     console.log('Deleting:', namespaceKey)

//     await FUZZYKEY.delete(namespaceKey);

//     return new Response(JSON.stringify({
//       status: true,
//     }), {
//       headers: corsHeaders
//     })
//   } catch (e) {
//     console.error('[deleteHandler]', e)
//     return new Response('Something went wrong with your request')
//   }
// }

















// export const getHandler = async (request) => {
//   /* 
//     - list all keys
//     - get specific key by scope / key
//   */
//   try {
//     const url = new URL(request.url);
//     const params = new URLSearchParams(url.search);

//     const list = params.get('list');
//     const listData = params.get('listData');
//     const scope = params.get('scope');
//     const key = params.get('key');
//     const metadata = params.get('metadata');

//     // only do this if not a pure GET handler (e.g. via POST command)
//     // let { scope, key, metadata } = JSON.parse(body)
//     let namespaceKey = `${scope ? scope + '/' : ''}${key || ''}`

//     console.log('namespaceKey:', namespaceKey)

//     let data;

//     // listing all keys w/ scope
//     if (list) {
//       return listByScope(scope, listData)
//     } else {
//       console.log('getting data')
//       // retrieving data
//       if (metadata) {
//         data = await FUZZYKEY.getWithMetadata(namespaceKey)
//         try { data.data = JSON.parse(data?.value) } catch (e) { }
//         delete data?.value // saves some data
//       } else {
//         data = await FUZZYKEY.get(namespaceKey)
//         try { data = JSON.parse(data) } catch (e) { }
//         data = { data } // encapsulate so this shape looks like getWithMetadata's shape, for easier coding later
//       }
//       return new Response(JSON.stringify({
//         status: data?.value || data ? true : false,
//         namespace: namespaceKey,
//         ...data
//       }), {
//         headers: corsHeaders
//       })
//     }

//   } catch (e) {
//     console.error('[getHandler]', e)
//     return new Response(JSON.stringify(`Something went wrong with your request`), {
//       headers: corsHeaders
//     });
//   }
// }





  // config = {
  //   "transformers": ["outputObject"],
  //   "sources": [
  //     {
  //       "name": "site-data",
  //       "type": "cfnotion",
  //       "path": "/collection/cccaab5d7ee04ebd9a42dbf2227c1cdb",
  //       "transformers": [
  //         {
  //           "function": "transformArrayToObjectByKey",
  //           "settings": {
  //             "objectKey": "Name"
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "name": "site-pages",
  //       "type": "cfnotion",
  //       "path": "/collection/c94e18d29ab54bdc8318d6a41f683e92",
  //       "loaders": {
  //         "notionPageId": "id"
  //       },
  //       "transformers": [
  //         {
  //           "function": "transformArrayVersionedObjects",
  //           "settings": {
  //             "uniqueKey": "Path", // unique field to track versions against
  //             "versionKey": "Version", // version name / number field
  //           }
  //         }
  //       ]
  //     },
  //   ]
  // }