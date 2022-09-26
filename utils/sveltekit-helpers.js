
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

export async function errorjson(status = 500, data, headers = {}, ) {
  let json = JSON.stringify(data)
  return new Response(json, {
    status,
    headers: {
      'Content-Type': 'application/json',
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
