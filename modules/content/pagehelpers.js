
/* 

  Getters for data stored in $page.data, similar to the Content Store in store.js
  - use this for new Sveltekit


*/

import * as store from 'svelte/store'
import { page } from '$app/stores';



export const _get = (name, table = 'Content') => {
  // console.log('getttt', name, table, '||yy||', '||xx||', store.get(page)?.data)
  return store.get(page) && store.get(page)?.data[table] && store.get(page)?.data[table].find(e => e['Name'] == name)
}

// shortcut: Content Table > Content Field
export const _content = (name, fieldName = 'Content') => {
  // return empty text if loading / prepping for markdown
  return _get(name) && _get(name).fields && _get(name).fields[fieldName] || ''
}
export const _contents = (names) => {
  let obj = {}
  names.forEach(name => {
    obj[name] = _content(name)
  })

  return obj
}

