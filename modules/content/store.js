
/* 

  Svelte Store for general site content for front-end

  - store Airtable, Grabby, Notion, user profiles, and other copy used for the site

  Usage:
  - use either __layout or a content page to add content to the store
  - treat the store like a keymap (it's an object)
  - get content from the load fn context module


	import { Store as Content } from "$plasmid/modules/content/store.js"
  export let content, profiles, glossary, blog_list, content_table
  // content = {
  //   'key': value,
  //   'keys': [values],
  //   ...
  // }
  $: $Content = content
  $: $Content['profiles'] = profiles
  $: $Content['glossary'] = glossary
  $: $Content['content_table'] = content_table[0]

*/

import * as store from 'svelte/store'

// The following content should be populated by _layout on page load
// or whichever page(s) are using the Endpoint, to speed up subsequent loads



// SiteData should mirror a cytosis.results setup
// results['Content','Profiles']
export const Store = store.writable({})

// gets the record
export const _get = (name, table = 'Content') => {
  // console.log('get', name, store.get(Store), store.get(Store)[table])
  return store.get(Store) && store.get(Store)[table] && store.get(Store)[table].find(e => e['Name'] == name)
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

