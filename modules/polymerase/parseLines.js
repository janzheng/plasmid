

/* 

  This file deals with using LLMs to generate a Ramda curry fn to parse lines, and using a zod validator to optionally validate and extract a subset

  requires Ramda async

  
  Use LLM to generate Ramda curry code:

  ```
  Using this example:

  R.curry((line) => {
    const [name, email] = R.split(', ', line);
    return { name, email };
  });


  Please give me a similar Ramda curry function that breaks the following string:
  "Jon Doe, 123 Alpha St, Alpharetta, GA 4432831723, Signed up last night, needs to be emailed first and added to roster"

  into an object that looks like: {name, street, city, state, phone, notes}.

  Please only return the Ramda function starting with R.curry(() =>{}). Do not explain the code.

  ```

*/


// // Example of how to generate a Ramda curry function, and use eval / new Function to process some text
//   const ramdaStrExample = `
//     return R.curry((line) => {
//       const [name, street, city, state, phone, ...notes] = R.split(', ', line);
//       return { name, street, city, state, phone, notes: notes.join(', ') };
//     });
//   `;
  
//   // Create a new function from the string
//   const funcFromString = new Function('R', `${ramdaStrExample}`);
//   // Pass in Ramda as the argument to this function
//   const dynamicParserFn = funcFromString(R);
//   // The string you want to parse
//   const someText = "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster";
  
//   // Parse the string using the function you created
//   console.log('Dynamically extracted data:', dynamicParserFn(someText))


import * as R from 'ramda';
import * as RA from 'ramda-async';
import { z } from "zod";





// Define our generateRamdaStrFromText function
export const generateRamdaStrFromText = async ({
  str="Jon Doe, 123 Alpha St, Alpharetta, GA 4432831723, Signed up last night, needs to be emailed first and added to roster", 
  schema="{{name, street, city, state, phone, notes}}",
  maxAttempts = 1,
  url = `https://pd-api.fly.dev/gen/api/prompt`,
  // url = `http://localhost:3051/gen/api/prompt`,
}) => {
  // Simulate fetching the parser string from the server
  // const parserStr = await new Promise(resolve => setTimeout(() => resolve(`
  //   return R.curry((line) => {
  //     const [name, street, city, state, phone, ...notes] = R.split(', ', line);
  //     return { name, street, city, state, phone, notes: notes.join(', ') };
  //   });
  // `), 1000));

  console.log('[generateRamdaStrFromText] inputs:', str, schema)
  let attempts = 0
  
  // this lets you send stringified JSON objects into the LLM prompt
  let jsonschemaing = JSON.stringify(schema).replace(/[{]/g, '{{').replace(/[}]/g, '}}');
  let body = JSON.stringify({
    "prompt": `Using this example:

R.curry((line) => {{
const [name, email] = R.split(', ', line);
return {{ name, email }};
}});

Please give me a similar Ramda curry function that breaks the following string: ${str}
into an object that looks like: ${jsonschemaing}.

Please only return the Ramda function starting with R.curry(() =>{{}}). Do not explain the code.
`
  })
  
  while (attempts < maxAttempts) {
    try {
      attempts += 1;
      
      console.log('[generateRamdaStrFromText] sending prompt:', body)
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
      if(data && data.result) {
        let result = data?.result
        result = "return " + result
        return result
      }
    } catch(e) {
      // catches eiher incorrect json or bad schema
      console.error(e)
    }
  }
  throw new Error(`Could not create Ramda after string ${maxAttempts} attempts`);
};





/* 
    returns the ramdaStr as exectuable code

    ramdaStr should look like:

    return R.curry((line) => {
      const [name, street, city, state, phone, ...notes] = R.split(', ', line);
      return { name, street, city, state, phone, notes: notes.join(', ') };
    });

*/
export function createRamdaParser(ramdaStr) {
  const strFunc = new Function('R', ramdaStr);
  return strFunc(R);
}

// transformFn is a Ramda transformer like R.pick(['street'])
// this is INEFFICIENT because it calls generateRamdaStrFromText each time
// but it creates a good DX
export const parseLine = R.curry(async (sampleLine, transformFn, line) => {
  const ramdaStr = await generateRamdaStrFromText(sampleLine);
  const parser = createRamdaParser(ramdaStr);
  const parsed = parser(line);
  if (transformFn) return transformFn(parsed);
  return parsed
});

// does not call an LLM, but instead just requires the ramdaStr to be fed in
// note that invoking createRamdaParser in a loop is still inefficient
export const parseLineStr = R.curry((ramdaStr, transformFn, line) => {
  const parser = createRamdaParser(ramdaStr);
  const parsed = parser(line);
  if (transformFn) return transformFn(parsed);
  return parsed
});


export const parseLines = async (strings, transformFn) => {
  if(!strings.length) return [];

  const parseStr = await generateRamdaStrFromText(strings[0]);
  const parser = createRamdaParser(parseStr);

  const results = await Promise.all(
    strings.map(str => {
      if (transformFn) return transformFn(parser(str));
      return parser(str)
    })
  );
  return results
}



// Use parseLine function / functional version
// parseLine(
//   "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster", 
//   R.pick(['street']), 
//   "Jane Doe, 456 Beta St, Betaville, GB, 5555555555, Signed up this morning, needs to be called and added to roster"
// )
// .then(console.log)  // Logs: { street: '456 Beta St' }
// .catch(console.error);

// iife version
// (async () => {
//   try {

//     // example of combining Ramda in a curried example
//     const parseLine = R.curry(async (sampleLine, transformFn, line) => {
//       const parseStr = await generateRamdaStrFromText(sampleLine);
//       const parser = createRamdaParser(parseStr);
//       const parsed = parser(line);
//       return transformFn(parsed);
//     });

//     const result = await parseLine(
//       "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster",
//       R.pick(['street']),
//       "Jane Doe, 456 Beta St, Betaville, GB, 5555555555, Signed up this morning, needs to be called and added to roster"
//     );
    
//     console.log(result);  // Logs: { street: '456 Beta St' }

//   } catch (error) {
//     console.error(error);
//   }
// })();




  // (async () => {
  //   try {
  //     const strings = [
  //       "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster",
  //       "Jane Doe, 456 Beta St, Betaville, GB, 5555555555, Signed up this morning, needs to be called and added to roster",
  //       "Sam Smith, 789 Gamma St, Gammaville, GC, 6666666666, Signed up yesterday, needs to be texted and added to roster",
  //       "Tom Thumb, 101112 Delta St, Deltaville, GD, 7777777777, Signed up last week, needs to be mailed and added to roster",
  //       "Jerry Johnson, 131415 Epsilon St, Epsilonville, GE, 8888888888, Signed up last month, needs to be faxed and added to roster"
  //     ];

  //     const results = await Promise.all(
  //       strings.map(str => 
  //         parseLine(
  //           "Jon Doe, 123 Alpha St, Alpharetta, GA, 4432831723, Signed up last night, needs to be emailed first and added to roster",
  //           R.pick(['street']),
  //           str
  //         )
  //       )
  //     );
      
  //     console.log(results);  // Logs: [ { street: '123 Alpha St' }, { street: '456 Beta St' }, ... ]
  //   } catch (error) {
  //     console.error(error);
  //   }
  // })();

  // (async () => {
  //   try {

  //       const parser = await generateRamdaStrFromText({
  //           str: "Escherichia coli, pae7, Jessica Sacher, fridge 142.3.xa.b$2", 
  //           schema: "{{hostName, phageName, contact, location}}"
  //         });
  //       const parsed = parser("Burkholderia, bcep12, Jessica Sacher, fridge 1421.43f8");
        
  //       console.log("bacteria example:", parsed);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // )();

