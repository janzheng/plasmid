
/* 

  This file deals with generating a Zod schema from unstructured text, and returns a Zod schema js obj that can be used to validate stuff

  Useful for:
  - if given an array of objects, can generate a schema on the first object, then use it to validate the rest

  requires Ramda async

  (temporary) generateSchemaFromText: calls an LLM to get a zodSchemaStr that we then eval into a zod object

  createZodObject: Creates a Zod object from a zodSchemaStr

  A zodSchemaStr looks like declaring a zob object, but is a string. We're using eval to execute it.
    z.object({{
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    }});

  todo: 
    [x] break down generateSchemaFromText into a fn that takes a zodSchemaStr and evals it into a zod object
      - this obviates the LLM caller and just calls extractStructuredDataFromText
      - remove generateSchemaFromText into somewhere else, and remove the eval fn
    [x] generateSchemaFromText now just returns a stringified Zod schema (or JSON schema)
    [ ] createZodObject should be sandboxed along w/ the parser, so the generated schema always evals + parses the text

*/


import * as R from 'ramda';
import * as RA from 'ramda-async';
import { z } from "zod";






// GENERATING ZOD SCHEMA FROM UNSTRUCTURED TEXT and then merging it with predefined schema

// Mock function to generate schema from unstructured text
// type is either "json schema" or "zod"
// let url = `https://pd-api.fly.dev/gen/api/prompt` | http://localhost:3051/gen/api/prompt
// "schema" is a string w/ suggested schema, e.g. "name, email", or other things for the llm to look out for
export const generateSchemaFromText = async ({ 
  str, schema, maxAttempts = 1, schemaType = 'zod',
  url = `https://pd-api.fly.dev/gen/api/prompt`,
  // url = `http://localhost:3051/gen/api/prompt`,
}) => {
  console.log('[generateSchemaFromText] inputs:', str, schema)
  let attempts = 0

  // this lets you send stringified JSON objects into the LLM prompt
  let jsonSchemaString = JSON.stringify(schema).replace(/[{]/g, '{{').replace(/[}]/g, '}}');
  let body = JSON.stringify({
    "prompt": `Given this partial schema definition and/or suggested entities: """${jsonSchemaString}]""", please generate a ${schemaType} schema object from this text: """${str}""". 
Please output the ${schemaType} object without any markdown back ticks or wrappers. Do not describe your results. Do not wrap in markdown backticks or HTML. Do not output JSON Schema or any other schemas. Please output the 

${schemaType == 'zod' ? `Zod object as a z.object.
Only include z.object. Don't call .parse. Don't call .safeParse. Don't specify any other code. Only output code that includes z.object({{ ... }}). Don't chain code.

Example of a Zod schema object. Please output your result in a newline delimited string like this:
z.object({{
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
}});
` : `JSON Schema. Please output your result in a newline delimited string like this:
{{
  "$schema": "https://json-schema.org/draft/2020-12/schema#",
  "type": "object",
  "properties": {{
    "name": {{
      "type": "string"
    }},
    "id": {{
      "type": "string"
    }},
    "email": {{
      "type": "string",
      "format": "email"
    }}
  }},
  "required": ["name", "id", "email"]
}}
`}
`
  /*   let body = JSON.stringify({
      "prompt": `Given this partial schema definition and/or suggested entities: """${jsonSchemaString}]""", please generate a full ${type} object from this text: """${str}""". 
Please Only output the JSON, without any markdown back ticks or wrappers. Your output will be used in JSON stringify and evaluated. Do not describe your results. Do not wrap in markdown backticks or HTML. 
Do not return with \`\`\`json ..., just show output the json.

Example of a zod schema that you should return, if asked to return a zod object:

z.object({{
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
}});
` */
  })

  while (attempts < maxAttempts) {
    try {
      attempts += 1;

      console.log('[generateSchemaFromText] sending prompt:', body)
      let res = await fetch(`${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await res.json()
      if (data && data.result) {
        let schemaStr = data?.result
        console.log('[generateSchemaFromText] generated zod schema string:', schemaStr)
        if (typeof schemaStr === "string" && schemaType !== 'zod') {
          return JSON.stringify(schemaStr)
        }
        // zod needs to be returned as a string since it's a js object and not json serializable
        return schemaStr
      }
    } catch (e) {
      // catches eiher incorrect json or bad schema
      console.error(e)
    }
  }

  throw new Error(`Could not generate ${schemaType} schema after ${maxAttempts} attempts`);
};



export function createZodObject(zodSchemaStr) {
  let zodObject = null;

  // kind of like eval. Not as bad, but still not that good
  let zodSchemaCreatorFn;
  if (zodSchemaStr.includes("z.object")) {
    zodSchemaCreatorFn = new Function("z", `return ${zodSchemaStr};`);
  } else {
    zodSchemaCreatorFn = new Function("z", `return z.object(${zodSchemaStr});`);
  }
  zodObject = zodSchemaCreatorFn(z);
  return zodObject;
}











/* 

  DEPRECATE Note: this isn't really that useful. 
  Instead, a Ramda curry fn that takes [unstructured text, zodSchemaStr, [objects]],
  and can then use that new zod object to validate the array of objects would be more useful 

*/



// Your predefined schema
// const predefinedSchema = z.object({
//   email: z.string().email(),
//   fruit: z.string(),
// });


// Custom function to generate and validate a Zod schema
// const generateZodSchema = R.curry(async (predefinedSchema, maxAttempts, textToZodSchemaStrFn, createZodObjectFn, unstructuredText, schemaStr) => {
//   let attempts = 0;
//   let zodSchemaStr = null;
//   let zodSchema = null;

//   while (attempts < maxAttempts) {
//     attempts += 1;

//     // Generate the Zod schema
//     zodSchemaStr = await textToZodSchemaStrFn({ str: unstructuredText, schemaStr });
//     zodSchema = createZodObjectFn(zodSchemaStr);

//     // Merge the generated schema with the predefined schema
//     if (predefinedSchema && zodSchema) {
//       zodSchema = predefinedSchema.merge(zodSchema);
//     }

//     if (zodSchema instanceof z.Schema) {
//       return zodSchema;
//     }
//   }

//   throw new Error(`Could not generate and validate zod schema after ${maxAttempts} attempts`);
// });


//   // (async() => {
//   //   const customZodSchema = await generateZodSchema(predefinedSchema, 5, generateSchemaFromText, unstructuredText, "name, email");
//   //   console.log("customZodSchema:", customZodSchema);
//   // })()
//   // Use your custom function

