

/* 
  Checks for "Secret Pairs" in env:

  # secret pairs: [secret_name,token;secret_name2|token2]
  SECRET_PAIRS = "demo,conan_rocks;prod,password1234"

*/
export const checkToken = (token, separator = "|") => {
  if (!process.env.SECRET_PAIRS) return
  // token is the key that needs to match
  // future: should name secret_name AND token for more security
  let secretPairs = process.env.SECRET_PAIRS.split(separator)
  // console.log('checking secret token', token, secretPairs)
  if (!secretPairs || !token || secretPairs.filter(x => x.split(',')[1] == token).length == 0) {
    throw new Error('Invalid secret or SECRET_PAIRS not defined')
    // return new Response(`Provide a valid token | token: ${token}`, { status: 500 });
  }
  const secretName = secretPairs.filter(x => x.split(',')[1] == token)[0].split(',')[0]
  console.log('[secretName]', secretName) // e.g. 'demo'
  return secretName
}
