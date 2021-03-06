
/* 

  Helpers for reading Notion blocks; used in conjunction with sveltekit-notion, grabby, and cf-notion-api-worker

*/








/* 

  getBlockValues

  transforms notion data (block array) to usable blocks for sveltekit-notion
  - this is required bc notion wraps each block with a { value: ... } entry

  example: 
  <script context="module">
    // export const prerender = true;

    import { getBlockValues } from '$lib/project/phaus/helpers.js'
    
    // see https://kit.svelte.dev/docs#loading
    export const load = async ({ fetch }) => {
      let blocks, res
      
      res = await fetch('/api/endpoints/grabby?id=about');
      if (res.ok) {
        let json = await res.json();
        blocks = getBlockValues(json)
        return {
          props: { 
            blocks
          }
        };
      }
    };
  </script>


*/
// Object.values(json[0]).map((el) => el.value)
export const getBlockValues = (blockArray) => {
  if (blockArray && blockArray.length > 0) {
    return [
      ...blockArray.map(block =>
        Object.values(block).map((el) => el.value)
      )
    ]
  }
  return null
}