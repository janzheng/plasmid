
// todo: add ada-002 embedder and chromadb connection

export const config = {
  "transformers": [
    {
      "function": "outputArray",
      "settings": {
        "flatten": true
      }
    },
  ],
  "sources": [
    {
      "name": "evg_authors",
      "type": "jsonlines",
      "inputs": {
        "path": "./src/lib/cytosis2/evg.authors.jsonl"
      },
      "transformers": [
        {
          "function": "pickColumnsFromObjectArray",
          "settings": {
            "keys": ["authors"],
          }
        },
        {
          "function": "combineColumnsFromObjectArray",
          "settings": {
            "keys": ["authors"],
          }
        },
        {
          fn: (obj) => {
            let authors = []
            obj.authors.forEach(authorStr => {
              // each str lokos like: Aleksandra Otwinowska <sup>1*</sup>
              // only retain everything before " <sup> ..."
              let author = authorStr.split("<sup>")[0].trim()
              authors.push(author)
            })
            // get unique authors
            authors = [...new Set(authors)]
            authors = authors.sort()
            return authors
          }
        }
      ]
    },
  ]
}