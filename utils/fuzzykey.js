
/*

  wrappers for Fuzzykey CF worker KV

  usage:
    import { PUBLIC_FUZZYKEY_URL } from '$env/static/public';
    import FuzzyKey from '$src' 
    let fuzzy = FuzzyKey({ url: PUBLIC_FUZZYKEY_URL })
    await fuzzy.set("banana/rama", {fruit:"Banana!!11123"})
    let fzz = await fuzzy.get("banana/rama")
*/

export default function FuzzyKey({scope, url} = {}) {

  
  const set = async (key, value, scope, ttl=3600*4, metadata) => {
    if(typeof key == 'object') {
      ({key, value, scope, ttl, metadata} = key) // if "key" is the entire object
    }
    try {
      let obj = {
        "key": key,
        "value": value,
        "metadata": metadata,
        "ttl": ttl,
      }

      if(scope)
        obj['scope'] = scope

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify(obj)

        // NOTE: value now comes pre-wrapped, so we shouldn't wrap it again. Always put whatever you get, w/o mods
        body: JSON.stringify(value)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    } 
  }


  // base GETter w/ only a single key
  const get = async (key, metadata=true) => {
    try {
      const response = await fetch(`${url}?&key=${key}${metadata==true ? '&metadata=true' : ''}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // separation of scope and key can be helpful sometimes
  const sget = async (scope, key) => {
    try {
      const response = await fetch(`${url}?scope=${scope}&key=${key}&metadata=true`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const list = async (scope) => {
    try {
      let obj = {list: true}
      if(scope)
        obj['scope'] = scope

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    } 
  }

  /* 
    Delete will ALWAYS return true....
    and since KV is eventually consistent it can take up to 60s 
    for the record to actually disappear.
  */
  const del = async (key) => {
    try {
      const response = await fetch(`${url}?&key=${key}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  return { set, get, sget, list, del}
}