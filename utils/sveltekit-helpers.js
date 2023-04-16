
/*

  Abstract the boring stuff of Sveltekit

	
  last updated: 9/26/2022

*/

// import send from '@polka/send';
// // import * as _ from '@polka/redirect'


/*
  json wrapper around send 

  usage:
	
    return sendData({
      status: false,
      message: `Verification token is invalid or has expired.`, 
    }, res)


*/
// handles any data, not just json; need to stringify before using
export async function send(data, headers = {}, status, statusText = 'ok') {
  // let json = JSON.stringify(data)
  return new Response(data, {
    status,
    statusText,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

export function errorjson(status = 500, data, headers = {}, ) {
  let json = JSON.stringify(data)
  return new Response(json, {
    status:500,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}



// created to allow CORS, but vercel.json headers can do that instead, so this doesn't do much
// do SWR out of the box
export function hjson(data, headers = {
}, url='*') {
  let json = JSON.stringify(data)
  return new Response(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': url,
      // "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      'Access-Control-Allow-Credentials': true,
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
      // "Cache-Control":`public, s-maxage=${30}, max-age=${60*60*0.1}, stale-while-revalidate=${60*4}`, 
      // 60s fresh cache but 7 day cache; max-age determines "freshness" and swr time is whenever the stlate data gets sent over
      // "Cache-Control":`public, s-maxage=${10}, max-age=${10}, stale-while-revalidate=${10}`, 
      "Cache-Control": `public, s-maxage=${60}, max-age=${60}, stale-while-revalidate=${60 * 60}`,
      ...headers
    }
  });
}

export async function cachedjson (data, headers = {}, status = 200, statusText = 'ok') {
  let json = JSON.stringify(data)
  return new Response(json, {
    status,
    statusText,
    headers: {
      'Content-Type': 'application/json',
      "Cache-Control":`public, s-maxage=${30}, max-age=${60*60*0.1}, stale-while-revalidate=${60}`,
      // max-age: (used by browsers) 10 minute cache
      // s-maxage: (cloudf, vercel) 1 hr cache
      ...headers
    }
  });
}
