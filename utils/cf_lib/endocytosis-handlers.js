
import { corsHeaders } from './cors-handler.js'
import { endo } from '../../modules/cytosis2/cf-endo.js';

// FUTURE: Support Airfetch-like database adds / mutations

export const postHandler = async (request) => {
  try {
    const body = await request.text();
    let { config, scope, key, metadata, ttl = 3600 * 8 } = JSON.parse(body)
    let namespaceKey
    
    // console.log('CONFIG:', config)


    if (!config) {
      return new Response(JSON.stringify(`POST needs a config`), {
        headers: corsHeaders
      });
    }

    let value = await endo(config, {mode: 'cloudflare'}, request)
    if (key) {
      namespaceKey = `${scope ? scope + '/' : ''}${key || ''}`
      if (!metadata) {metadata = {}}
      metadata['created'] = Date.now()
      const result = await FUZZYKEY.put(namespaceKey, JSON.stringify(value), {
        metadata: { ...metadata, ttl },
      });
    }

    return new Response(JSON.stringify({
      status: true,
      key: namespaceKey,
      value
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