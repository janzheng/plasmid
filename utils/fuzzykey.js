
/*

  wrappers for Fuzzykey CF worker KV

  usage:
    import { PUBLIC_FUZZYKEY_URL } from '$env/static/public';
    import FuzzyKey from '$src' 
    let fuzzy = FuzzyKey({ url: PUBLIC_FUZZYKEY_URL })
    await fuzzy.set("banana/rama", {fruit:"Banana!!11123"})
    let fzz = await fuzzy.get("banana/rama")
*/

import { Sema } from 'async-sema';
export default function FuzzyKey({scope, url} = {}) {

  const sema = new Sema(4); // limit to 10 concurrent executions

  const fetchWithSema = async (url, options) => {
    await sema.acquire();
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[fuzzykey/fetch] Fetch Error:', error);
    } finally {
      sema.release();
    }
  };

  
  
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

      const data = await fetchWithSema(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify(obj)

        // NOTE: value now comes pre-wrapped, so we shouldn't wrap it again. Always put whatever you get, w/o mods
        // body: JSON.stringify(value) // this completely breaks it for local deploys — sometimes value is already wrapped, other times not
        body: value.key ? JSON.stringify(value) : JSON.stringify(obj)
      });
      return data;
    } catch (error) {
      console.error('FuzzKey/Set Error:', error);
    } 
  }


  // base GETter w/ only a single key
  const get = async (key, metadata=true) => {
    let src = `${url}?&key=${key}${metadata == true ? '&metadata=true' : ''}`
    try {
      const data = await fetchWithSema(src);
      // const data = await response.text()
      return data;
    } catch (error) {
      console.error('FuzzKey/Get Error:', src, error);
    }
  }

  // separation of scope and key can be helpful sometimes
  const sget = async (scope, key) => {
    try {
      const data = await fetchWithSema(`${url}?scope=${scope}&key=${key}&metadata=true`);
      return data;
    } catch (error) {
      console.error('FuzzKey/SGet Error:', error);
    }
  }

  const list = async (scope) => {
    try {
      let obj = {list: true}
      if(scope)
        obj['scope'] = scope

      const data = await fetchWithSema(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      });
      return data;
    } catch (error) {
      console.error('FuzzKey/List Error:', error);
    } 
  }

  /* 
    Delete will ALWAYS return true....
    and since KV is eventually consistent it can take up to 60s 
    for the record to actually disappear.
  */
  const del = async (key) => {
    try {
      const data = await fetchWithSema(`${url}?&key=${key}`);
      return data;
    } catch (error) {
      console.error('FuzzKey/Del Error:', error);
    }
  }
  
  return { set, get, sget, list, del}
}