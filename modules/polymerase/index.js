/* 

    Polymerase

    This is a set of tools that turns unstructured and semi-structured text into structured text.
    "Semi-structured" are arrays of strings that fit a pattern, like log output

    Most of these methods wrap around Ramda and are meant for further processing.

    

    Notes + Caveats
    - Some call out to OpenAI / pd-api's LLM endpoint
    - Tons of EVAL / new Function calls are used, so be wary of the dangers
    - USES A TON OF EVAL!!!!!



    Towards v1


    - Clean up todo
      - rename: transformData to transformDataBySchema
      - I know you hate typescript but this probably needs to be ts
      - LLM calling code
        - should be moved somewhere else and "inverted"
        - functions should combine LLM code, retries, and these parsers, rather than these parsers envelop LLM and retry code

    Todo + thoughts on production + safety
      - Should probably pass in the generated LLM text as an argument
      - Create a separate harness for retries for schema or Ramda correctness
      - Originally set up to return Ramda / Zod object code, but should probably just eval the data output and return the data itself
      - Allow to be chained into Ramda-Async, and not return any code at all
      - Create a separate npm package (instead of using Plasmid) and create a Cloudflare Worker endpoint

    Future / Cool to have:
      - Consider creating examples of node child_process or web workers
      - Cool to save (or just return) Ramda pipeline and schema strings to be saved into a db
      - Cool to be able to just take zod and eval
      - Cool to be able to just eval Ramda string / pipe code — this allows Ramda to be run by a json config
      - Recursive Config-driven Ramda chains would be considered "Polymerase Chains" 



        
    [this is done; just keeping notes here]
    ultimate example
    - given a \n delimited string of names and emails in an unstructured text
    - have it generate a schema -- OR -- given a schema
    - OPTIONAL — have it generate an R code pipeline from the schema using the tools 
      - maybe create another function that takes the string and the Zod object, and creates a Ramda pipeline that assumes each line of the string is structured similarly, 
      - this saves a lot of money by not using an LLM for each row, but needs to assume each row is the same
    - extract each line from the newline separate string into an array of objects per the schema
  

    - todo:
      - in times when the generated parser fails, we should be able to call an LLM for that example, or create a new Ramda that takes care of that use case, with an LLM
  
    
*/



// for ease of importing from other functions
import { transformDataBySchema } from "$plasmid/modules/polymerase/transformDataBySchema.js";
export { transformDataBySchema };

import { extractStructuredDataFromText, transformUnstructuredText, validateStructuredTextData, splitLines, transformLine, transformLines } from "$plasmid/modules/polymerase/transformUnstructuredText.js";
export { extractStructuredDataFromText, transformUnstructuredText, validateStructuredTextData };

import { generateSchemaFromText, createZodObject } from "$plasmid/modules/polymerase/generateZodSchema.js";
export { generateSchemaFromText, createZodObject };

import { generateRamdaStrFromText, createRamdaParser, parseLine, parseLineStr, parseLines } from "$plasmid/modules/polymerase/parseLines.js";
export { generateRamdaStrFromText, createRamdaParser, parseLine, parseLineStr, parseLines };

import * as R from 'ramda';
import * as RA from 'ramda-async';
import { z } from "zod";



/* 

  demos and examples

*/

export const demos = () => {

  const unstructuredText = "My name is John Smith. My email is jon.smith@example.com and my address is 123 Street, Atlanta, Georgia. I like red apples";
  
  // Sample data
  const johnDoeData = {
    fields: {
      name: 'John Doe',
      email: 'jon.smith@example.com',
      address: '123 Street, Atlanta, Georgia',
      fruits: {
        apple: 'red',
      }
    }
  };
  
  // Schema (or mapping) used to transform data
  const schemaTransformer = {
    username: 'fields.name',
    email: 'fields.email',
    appleColor: 'fields.fruits.apple',
    favorite: 'fields.trees', // fails; undefined
  };
  
  const sampleNameSchema = {
    username: 'fields.name',
    email: 'fields.email',
  };

  const sampleNameSchemaStr = "name, email, appleColor, fruitPreference"

  const zodSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  });

  
  /*

    // Demo of extractStructuredDataFromText async usage — get structure from unstructured data w/ an LLM and a schema suggestion
    (async () => {
      // const structuredText = await extractStructuredDataFromText({ str: unstructuredText, schema: sampleNameSchema });
      const structuredText = await extractStructuredDataFromText({ str: unstructuredText, schema: sampleNameSchemaStr});
      console.log("[extractStructuredDataFromText demo] \nunstructuredText:", unstructuredText, "\n>>", structuredText);
    })();

  */
  

    // Demo of transformUnstructuredText

    (async () => {

      const unstructuredText = "My name is John Smith. My email is jon.smith@example.com and my address is 123 Street, Atlanta, Georgia. I like red apples";
      // const structuredTextData = await transformUnstructuredText(
      //   { 
      //     schema: sampleNameSchemaStr, 
      //     extractorFn: extractStructuredDataFromText,
      //     // zodSchema: zodSchema // this forces the results to only match the schema
      //   }, 
      //   unstructuredText
      // );
      // console.log("[transformUnstructuredText demo]:\n", unstructuredText, "\n>>", structuredTextData);

      // Chain it with other Ramda functions
      // const structuredTextResult = await RA.pipeAsync(
      //   transformUnstructuredText({ schema: sampleNameSchemaStr, extractorFn: extractStructuredDataFromText }),
      //   R.prop('name'),
      //   R.toUpper
      // )(unstructuredText);
      // console.log("[transformUnstructuredText chain demo]:\n", unstructuredText, "\n>>", structuredTextResult); // The transformed username in uppercase


      // try {
      //   // Use the generated schema to transform and validate each line
      //   const inputStr = `
      //     Jon Smith, jonsmith@example.com
      //     Adam Appleby, aapl@example.com
      //     Banana Rama, barama@example.com
      //   `;
      //   // const inputStr = `Jon Smith, jonsmith@example.com`;

      //   let output = await transformLines({
      //       schema: "name, email",
      //       extractorFn: extractStructuredDataFromText,
      //     }, 
      //     splitLines(inputStr)
      //   );
      //   output = output.filter(x=>x)
      //   console.log("[extractStructuredDataFromText / multiline demo] input:", inputStr, "\n>>>", output);
      // } catch (error) {
      //   console.error(error);
      // }

    })();




  /*
    // Demo of generating a Zod to a zod object, or a jsonschema to text
    
    (async () => {
      const zodSchemaStr = await generateSchemaFromText({ str: unstructuredText, schema: "name, email" });
      const zodSchema = createZodObject(zodSchemaStr);
      console.log("[generateSchemaFromText demo] (zod):", unstructuredText, "\n>> ", zodSchemaStr, zodSchema);

      const jsonSchema = await generateSchemaFromText({ str: unstructuredText, schema: "name, email", schemaType: 'jsonschema' });
      console.log("[generateSchemaFromText demo] (jsonschema):", unstructuredText, "\n>> ", jsonSchema);
    })();
  */



  
  // Demo of generating Ramda strings, turning them into R.curry functions and executing them against data
  (async () => {

    // // example of generating Ramda string from an example, and then parsing another line using the Ramda fn
    // const unstructuredTextRamdaExample = "Jon Doe, 123 Alpha St, Alpharetta, GA 4432831723, Signed up last night, needs to be emailed first and added to roster"
    // const schema = "{{name, street, city, state, phone, notes}}"
    // const ramdaStr = await generateRamdaStrFromText({ str: unstructuredTextRamdaExample, schema: schema });
    // const parser = createRamdaParser(ramdaStr);
    // console.log("[generateRamdaStrFromText demo]:", 
    //   unstructuredText, "\n>> ", ramdaStr, "\n>>", parser, "\n>>", 
    //   parser("Jane Doe, 456 Beta St, Betaville, GB, 5555555555, Signed up this morning, needs to be called and added to roster")
    // );

    // // example of a bacterial / phage structure
    // const phageRamdaStr = await generateRamdaStrFromText({
    //   str: "Escherichia coli, pae7, Jessica Sacher, fridge 142.3.xa.b$2",
    //   schema: "{{hostName, phageName, contact, location}}"
    // });
    // /* phageRamdaStr results as:
    //   return R.curry((line) => {
    //     const [hostName, phageName, contact, location] = R.split(', ', line);
    //     return { hostName, phageName, contact, location };
    // */
    // const phageParser = createRamdaParser(phageRamdaStr);
    // console.log("[generateRamdaStrFromText phage/bacterial demo]:",
    //   unstructuredText, "\n>> ", phageRamdaStr, "\n>>", phageParser, "\n>>",
    //   phageParser("Burkholderia, bcep12, Jessica Sacher, fridge 1421.43f8")
    // );



    // example of combining Ramda in a Ramda curry fn, picking out a street name only
    // const curryParseResult = await parseLine(
    //   "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster",
    //   R.pick(['street']),
    //   "Jane Doe, 456 Beta St, Betaville, GB, 5555555555, Signed up this morning, needs to be called and added to roster"
    // );
    // console.log("[generateRamdaStrFromText demo] curryParseResult:", curryParseResult);

    // example of using parseLine to process a list of strings
    // (async () => {
    //   try {
    //     const strings = [
    //       "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster",
    //       "Jane Doe, 456 Beta St, Betaville, GB, 5555555555, Signed up this morning, needs to be called and added to roster",
    //       "Sam Smith, 789 Gamma St, Gammaville, GC, 6666666666, Signed up yesterday, needs to be texted and added to roster",
    //       "Tom Thumb, 101112 Delta St, Deltaville, GD, 7777777777, Signed up last week, needs to be mailed and added to roster",
    //       "Jerry Johnson, 131415 Epsilon St, Epsilonville, GE, 8888888888, Signed up last month, needs to be faxed and added to roster"
    //     ];

    //     // Inefficient!! Don't do this!
    //     // const results = await Promise.all(
    //     //   strings.map(str => 
    //     //     parseLine(
    //     //       "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster",
    //     //       R.pick(['street']),
    //     //       str
    //     //     )
    //     //   )
    //     // );

    //     let results = await parseLines(strings)
        
    //     console.log("[parseLines / generateRamdaStrFromText strings array demo] results:", results);  // Logs: [ { street: '123 Alpha St' }, { street: '456 Beta St' }, ... ]
    //   } catch (error) {
    //     console.error(error);
    //   }
    // })();
  })();
 
    
}