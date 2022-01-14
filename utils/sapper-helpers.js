
/*

	Abstract the boring stuff of Sapper / Polka

	
  last updated: 8/14/2020

*/

import send from '@polka/send';
// import * as _ from '@polka/redirect'


/*
	json wrapper around send 

	usage:
	
    return sendData({
      status: false,
      message: `Verification token is invalid or has expired.`, 
    }, res)


*/
export async function sendData(data, res, code=200, headers={}) {
  const json = JSON.stringify(data)
  return send(res, code, json, {
    'Content-Type': 'application/json',
    ... headers
  });
}

// kind of dumb, but cleans up imports
export async function redir(res, path='/') {
	return _.redirect(res, path)
}