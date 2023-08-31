export const config = {
  // "loaders": {
  //   // "sourceFile": "../../../cytosis-data.json", // pull from this preloaded json file instad of fetching
  // },
  "transformers": [
    {
      "function": "outputArray", // default transformer that maps an array of sources to a keyed object
      "settings": {
        "flatten": true,
      }
    },
  ],
  "sources": [
    {
      "name": "evg-abstracts",
      "type": "airfetch",
      "settings": {
        "apiKeyName": "AIRTABLE_EVG_API",
        "baseIdName": "AIRTABLE_EVG_BASE",
      },
      "bases": [{
        "tables": ["Abstracts"],
        "options": {
          // "view": "Published"
          "view": "TESTABSTRACTS"
        }
      }],
      "transformers": [
        {
          "function": "transformFlattenKeyedObject",
        },
        {
          "function": "llmArrayPrompt",
          "settings": {
            // "key": "Title",
            "keys": ["Authors", "Affiliations"],
            "outputKey": "AuthorAffiliations",
            "prompt": `Here is a list of authors and affiliations for an abstract. 
            Please output a JSON object as following:
            {{
              "affiliations": ["University Name", "Company Name", "Department Name", "Institute Name"],
              "authors": ["Author Name <sup>1*</sup>", "Author Two <sup>2</sup>", "Author Name <sup>##</sup>"]
            }}

            How to format affiliations
            - All affiliations are listed in numerical order, separated by line breaks.
            - Maintain affiliation order in the output array as provided

            How to format authors:
            - Please retain all formatting for symbols like * as a super script, as they're to denote correspondence, coauthors, etc.
            - If an author has an affiliation number, please enclose with <sup>#</sup>

            General output requirements:
            - Please output as code, not text, but don't include fenced off code blocks
            - Only output valid JSON
            - Please don't add any examples or descriptions. Please don't describe the output.
            - If unclear how to proceed, or there's an error, only output "Error Occurred"
            - affiliationText is just a combination of "Affiliations" and "Authors" with affiliations listed as an ordered list in html
            
            Here is the author and affiliation data:
            `,
            "llm": {
              "apiKeyName": "OPENAI_API_KEY",
              "system": "You are a professor and mentor and expert in microbiolgy and phage!",
              "modelName": "gpt-3.5-turbo"
              // "modelName": "gpt-3.5-turbo"
            }
          }
        }
      ]
    }
  ]
}