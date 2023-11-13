
// import * as notionClient from "@notionhq/client";

/* 

  Helpers for reading Notion blocks; used in conjunction with sveltekit-notion, grabby, and cf-notion-api-worker

*/



/* 

  Simple fetcher for Notion API

*/


export const loadNotionPages = async (notionPageIds) => {
  try {
    let notionData = {}

    await Promise.all(notionPageIds.map(async (id) => {
      let res = await fetch(`https://notion-cloudflare-worker.yawnxyz.workers.dev/v1/page/${id}`)
      let json = await res.json();
      let data = Object.values(json).map((el) => el.value);
      notionData[id] = data
    }))

    return notionData
  } catch (e) {
    console.error('loadNotionPages error:', e)
  }
}




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




/* 

  Notion API helpers

*/

// send this in
// const notion = new notionClient.Client({
//   auth: process.env.NOTION_API,
// });

export const patchPage = async (pageId, properties, notion) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties,
    // properties: {
    //   'In stock': {
    //     checkbox: true,
    //   },
    // },
  });
  console.log('[notion/patchPage]',response);
  return response
}

export const createPage = async (parent, properties, notion) => {
  const response = await notion.pages.create({
    parent,
    properties,
    // properties: {
    //   'In stock': {
    //     checkbox: true,
    //   },
    // },
  });
  console.log('[notion/createPage]', response);
  return response
}

















/* 

  Useful converters

*/


export const search = (block, blocks) => blocks.find(el => el.id == block)

export const isTopLevel = (block, blocks) =>
  block.type !== search(block.parent_id, blocks).type

export const toNotionImageUrl = (url, blockId, siteSrc = "https://phagedirectory.notion.site") => {
  return `${siteSrc || "https://notion.so"}${url.startsWith('/image')
      ? url
      : `/image/${encodeURIComponent(url)}?table=block&id=${blockId}`
    }`
}

// export const getTextContent = block => {
//   const text =
//     block.properties && block.properties.title
//       ? block.properties.title
//       : null
//   return text ? text.reduce((prev, current) => prev + current[0], '') : ''
// }

export const getTextContent = (text) => {
  return text.reduce((prev, current) => prev + current[0], "");
};


export const groupBlockContent = blocks => {
  const output = []

  let lastType
  let index = -1

  blocks.forEach(block => {
    if (block.content) {
      block.content.forEach(blockId => {
        const subblock = search(blockId, blocks)
        if (subblock) {
          if (subblock.type && subblock.type !== lastType) {
            index++
            lastType = subblock.type
            output[index] = []
          }
          output[index].push(subblock.id)
        }
      })
      lastType = undefined
    }
  })
  return output
}

export const getListNumber = (block, blocks) => {
  const groups = groupBlockContent(blocks)
  const group = groups.find(g => g.includes(block.id))

  if (!group) return
  return group.indexOf(block.id) + 1
}

export const loadTwitter = () => {
  var id = 'twitter-wjs'

  // if script was already set, don't load it again.
  if (document.getElementById(id)) return

  var s = document.createElement('script')
  s.id = id
  s.type = 'text/javascript'
  s.async = true
  s.src = '//platform.twitter.com/widgets.js'
  document.getElementsByTagName('head')[0].appendChild(s)
}

export const isImage = attachment => {
  let name = attachment.name
  return (
    name.includes('.png') ||
    name.includes('.jpg') ||
    name.includes('.jpeg') ||
    name.includes('.tiff') ||
    name.includes('.gif') ||
    name.includes('.bmp') ||
    name.includes('.webp')
  )
}














export const getNotionValue = (
  val,
  type,
  row
) => {
  switch (type) {
    case "text":
      // return val; // includes formatted content like bold and anchors, but a pain to parse
      // return getTextContent(val);
      return getFormattedTextContent(val);
    case "person":
      return (
        val.filter((v) => v.length > 1).map((v) => v[1][0][1]) || []
      );
    case "checkbox":
      return val[0][0] === "Yes";
    case "date":
      if (val[0][1] && val[0][1][0][0] === "d") {
        return val[0][1][0][1];
      }
      else
        return "";
    case "title":
      return getTextContent(val);
    case "select":
    case "email":
    case "phone_number":
    case "url":
      return val[0][0];
    case "multi_select":
      return val[0][0].split(",");
    case "number":
      return Number(val[0][0]);
    case "relation":
      return val
        .filter(([symbol]) => symbol === "‣")
        .map(([_, relation]) => relation[0][1]);
    case "file":
      if (!val[0][1]) // file is embedded link
        return [{ 'name': val[0][0].toString(), 'url': val[0][0].toString() }]

      return val
        .filter((v) => v.length > 1)
        .map((v) => {

          const rawUrl = v[1][0][1];

          const url = new URL(
            `https://www.notion.so${rawUrl.startsWith("/image")
              ? rawUrl
              : `/image/${encodeURIComponent(rawUrl)}`
            }`
          );

          url.searchParams.set("table", "block");
          url.searchParams.set("id", row.value.id);
          url.searchParams.set("cache", "v2");

          return { name: v[0], url: url.toString(), rawUrl };
        });
    default:
      console.log({ val, type });
      return "Not supported";
  }
};



export const getFormattedTextContent = (text) => {
  // console.log('---text:', text[0])
  // return text.reduce((prev, current) => {
  //   console.log('p/c', prev, current)
  //   return prev + current[0]}, "");
  const newtext = text
    .map(text =>
      text[1]
        ? text[1].reduceRight(
          (av, cv) =>
          ({
            i: `<em>${av}</em>`,
            c: `<code class="notion-inline-code">${av}</code>`,
            s: `<s>${av}</s>`,
            b: `<b>${av}</b>`,
            h: `<span class="notion-${cv[1]}">${av}</span>`,
            a: `<a class="notion-link" href="${cv[1]}">${av}</a>`,
          }[cv[0]]),
          text[0]
        )
        : text[0]
    )
    .join('')

  return newtext
};
