

/* 

  Generalized request functions here

*/


export function getReturnResponse(res) {
  // Handle JSON responses here
  // somehow RETRY if JSON parsing fails?
  let output = {
    type: null,
    result: null,
  }

  // replace all 
  try {
    let data = JSON.parse(res?.text);
    output.type = 'application/json'
    output.result = data
  } catch (e) {
    // return the text if not json
    output.type = 'text/plain'
    output.result = res?.text
    console.log('[getReturnResponse] Failed JSON parsing; returning as text:', e, res?.text)
  }
  return output
}

