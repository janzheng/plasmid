

/* 

  Generalized LLM functions here

  - experiments and one-offs go into /experiment
  - any helper code goes into /utils
  - maintain GOOD DX in this for all LLM calls for API-side
  - avoid langchain as it's HUGE; these need to be SMALL and FAST, for CF workers (< 1mb)

  Inspo:
  - Use OpenAI API: https://github.com/openai/openai-node 
  - Good DX: https://github.com/amaiya/onprem
  - Rivet: https://rivet.ironcladapp.com  

  Future:
  - shorten messages if hitting the token limit
  - split text, run, join - this only works on some workflows like summarize

  Far-Future:
  - (cytosis?) Message trees where you can go back and try something else and it branches
    - re-ask a question / ask alternative questions, then choose the right answer
    - needs to handle the right data mechanism (DAG)
  - splitting>chaining>joining tasks like Rivet
  - server-side stream onEnd handling (really annoying!! do this client-side and send back to server)
  - function calling (actually running them w/ LLM to decide on output) (might be cytosis)

  Not Supported / Cytosis Features?
  - ingest / update / remove / similar ask (embeddings) - or maybe a good DX interfce for it?
  - rolling summarize
  - chunk
  - batch processing, e.g. array of chat prompts + config

*/

import { getTokenLen } from './utils/tokens.js'
// import { getMessagesFromInput } from './utils/index.js'
import { getChatCompletion, initMessages, setSystemMessage, addUserMessage, addFuntionCallMessage, addAssistantMessage } from './utils/openai.js'
import { replaceKeys, parseMetadata } from '$plasmid/utils/helpers.js'

let addonLibrary = {
  "french": "Reply in French",
  "chinese": "Reply in Chinese (simplified)",
  "haiku": "Reply in Haiku",
  "stepby": "Let's think step by step.",
  "json": "Only reply in correct JSON. Start your response with '{' and end with '}'. Do not wrap your answer in backticks. Do not explain yourself.",
  "json-cota": "Only reply in correct JSON. Start your response with '{' and end with '}'. Do not wrap your answer in backticks. Do not explain yourself. Start with a 'Reasoning' key where you write out the reasoning, thinking step by step. Then, add a 'Solution' key where you write out the solution.",
  "code": "Do not wrap your answer in backticks. Do not explain yourself.",
}


export const fQuery = (input) => {
  let inputPrompt;
  let messages = []

  let config = { 
    // allowed to mutate as side effect of other fns — we want this to happen!
    // if it gets too messy, just create a new LLM object
    system: "You are a helpful assistant",
    model: "gpt-3.5-turbo", 
    // max_tokens: 256,
    temperature: 0.4,
    apiKey: null,
  };
  
  if (typeof input === 'string') {
    inputPrompt = input;
  } else {
    config = input || config;
  }
  
  try {
    const OPENAI_API_KEY = config?.apiKey || process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY env variable not set')
    }

    // uses the moderation API
    const moderation = async (input, verbose=false) => {
      let messages = initMessages(input);
      const moderationRes = await fetch('https://api.openai.com/v1/moderations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        method: 'POST',
        body: JSON.stringify({
          input: messages[messages.length - 1].content
        })
      })
      if (!moderationRes.ok) {
        const err = await moderationRes.json()
        throw new Error(err.error.message)
      }

      const moderationData = await moderationRes.json()
      const [results] = moderationData?.results
      // console.log('moderationData', results)
      return verbose ? results : results?.flagged
      // usage:
      // if (results.flagged) {
      //   throw new Error('Query flagged by openai')
      // }
    }


    // input is a prompt string, but can also be an array of well-formed chatCompletion objects!
    // prompt is a short/quick fn for both single-off chat and array conversations
    // always returns a string!
    const prompt = async (input, inputConfig) => {
      try {
        let _config = { ...config, ...inputConfig };
        if (_config?.moderation && await moderation(input)) { 
          // moderation if requested
          return {
            flagged: true,
            prompt: input,
          }
        }

        let messages=[]
        if (Array.isArray(input) && input.every(i => typeof i === 'string')) {
          // input is an array of strings
          /*
              [
                "You are a fantastic comedian",
                "Tell me a joke",
                "Why did the chicken cross the road? To take over the world.",
                "Explain the joke?",
              ]
          */
         let start = 0
          if(!inputConfig?.skipSystemMessage) {
            messages = setSystemMessage(messages, input[0])
            start = 1
          }
          for (let i = start; i < input.length; i++) {
            if ((i-start) % 2 === 0) {
              messages = addUserMessage(messages, input[i]);
            } else {
              messages = addAssistantMessage(messages, input[i]);
            }
          }

          
        } else if (Array.isArray(input)) {
          // standard array of messages; we assume it's correctly formed; system message is up to input
          messages = input;
        } else if (typeof input === 'object' && Object.keys(input).length > 0) {
          // input is a JS object with at least 1 key
          /*
            {
              system: "You are hilarious!",
              input: "Tell me a banana joke"
            }
          */
          if(input?.system) {
            messages = setSystemMessage(messages, input?.system)
          }
          if(input?.input) {
            messages = addUserMessage(messages, input?.input)
          }
        } else {
          // input is a string
          // add the input string either as a regular text string
          // or a s an array of properly-formatted openai chatCompletion objects
          if(inputConfig?.messages) {
            messages = addUserMessage(inputConfig?.messages, input);
          } else {
            messages = initMessages(input, _config);
          }
        }
      

        if(inputConfig?.replace) {
          // replaces {{name}} with the user's name from replace object: {name: "Jan"}
          // replaceOptions is the metadata, like dictionary, start/end symbols, etc
          messages = messages.map(message => {
            message.content = replaceKeys(message.content, inputConfig?.replace, inputConfig?.replaceOptions);
            return message;
          });
        }
        
        if (inputConfig?.addons) {
          let addons = inputConfig?.addons
          messages = messages.map(message => {
            if (inputConfig?.addonOptions?.onlySystem && message.role !== 'system') {
              return message
            } else {
              addons.forEach(addon => {
                // Check if addon exists in the addons object and replace it with the corresponding value
                let addonValue = addonLibrary[addon] ? addonLibrary[addon] : addon;
                message.content = `${message.content} | ${addonValue}`;
              });
            }
            return message;
          });
        }

        
        console.log('[assembled message + config]: \nmessages:', messages, '\nconfig:', _config) // this is really useful; keep it around!!

        let initTokenCount = getTokenLen(messages)
        // console.log('token count::', initTokenCount)
        if (_config?.tokenLimit && initTokenCount.total > _config?.tokenLimit) {
          throw new Error(`Token limit exceeded. Tokens: ${initTokenCount} / Limit: ${_config?.tokenLimit}`)
        }

        let { results, chatResponse } = await getChatCompletion(messages, { ..._config })

        if (_config?.stream) {
          // todo: figure out how to capture this later on, on load-end
          return results // response.body
        }

        if (_config?.functions) {
          messages = addFuntionCallMessage(messages, results)
        } else {
          messages = addAssistantMessage(messages, results)
        }

        if(_config.verbose) {
          return {
            messages,
            chatResponse: (_config?.showChatResponse && chatResponse) || null,
            initTokenCount,
            result: (_config?.showResult && results) || null
          }
        } else {
          // just return the string completion inference for short chats
          return results
        }
      } catch(e) {
        console.error("[prompt] error:", e);
        throw (e); // pass it up
      }
    }; const ask = prompt; // synonymous

    // chat is similar to prompt but returns more data like chat history
    const chat = async (input, inputConfig) => {
      return await prompt(input, {...inputConfig,
        verbose: true,
      })
    }




    /* 
    
    "functions": [
      {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    ]

    functions and responses can also be added as roles:

    messages.push({
        "role": "function",
        "name": functionName,
        "content": functionResponse,
    });  // extend conversation with function response

    
    */

    // returns json w/ just prompting; doesn't require a functions schema
    // this does NOT do json data extraction; the prompt or templates should do that instead
    const json = async (input, inputConfig) => {
      const getResult = async (input) => {
        return await prompt(input, {
          system: "You are a software engineer. Only respond in correct JSON. Start your response with '{' and end with '}'. Do not explain yourself. Do not use quotation marks, or wrap in markdown.",
          temperature: 0,
          // model: "gpt-4", // gpt-4 generally has much better responses
          ...inputConfig,
          // these MUST BE TRUE, or your code will break (*.result)
          showResult: true,
          verbose: true, 
        })
      }
      let output = await getResult(input);
      let counter = 0, tries = inputConfig?.tries || 5;

      let jsonOutput = null;
      while (!jsonOutput && counter < 5) {
        try {
          jsonOutput = JSON.parse(output.result);
        } catch (e) {
          counter++;
          if (counter < tries) {
            output = await getResult(input);
          }
        }
      }
      if (!jsonOutput) {
        throw new Error(`[json] Failed to parse JSON after ${tries} attempts`);
      }

      if (!inputConfig?.verbose)
        return jsonOutput;
      else {
        output['numTries'] = counter + 1;
        output['json'] = jsonOutput;
        return output;
      }
    }

    // function-calling, with retries; returns json; requires functions schema
    // limit the # of functions, as they fill the context limit (and are expensive)
    const funcall = async (input, inputConfig) => {
      if(!inputConfig?.functions || inputConfig?.functions.length == 0) {
        throw new Error('[llm/json] no functions specified')
      }

      const getResult = async (input) => {
        return await prompt(input, {
          system: "You are a software engineer. Only use the functions you have been provided with.",
          // functions: [], // send in schema definitions
          // function_call: {"name": "get_n_day_weather_forecast" } // force use
          // max_tokens: 4000, // this messes with response length / tokens
          temperature: 0,
          model: "gpt-3.5-turbo-16k", // use 16k for better context length, or gpt-4 for 8k length
          ...inputConfig,
          // these MUST BE TRUE, or your code will break (*.result)
          showResult: true, 
          verbose: true, 
        })
      }
      let output = await getResult(input);
      let counter = 0, tries = inputConfig?.tries || 5;
      let jsonOutput = null;
      while (!jsonOutput && counter < 5) {
        try {
          jsonOutput = JSON.parse(output.result.arguments);
        } catch (e) {
          counter++;
          if (counter < tries) {
            output = await getResult(input);
          }
        }
      }
      if (!jsonOutput) {
        throw new Error(`[funcall] Failed to parse JSON after ${tries} attempts`);
      }
    
      if (!inputConfig?.verbose)
        return jsonOutput;
      else {
        output['numTries'] = counter+1;
        output['json'] = jsonOutput;
        return output;
      }
    };

    // generator for function calling object, using fn calling and json schema to convert a prompt to a function call object w/ json schema
    const toSchema = async (input, inputConfig) => {
      const getResult = async (input) => {
        return await prompt(input, {
          system: "You are a software and data engineer. Extract all terms according to valid JSON Schema. Start your response with '{' and end with '}'. Do not explain yourself. Do not use quotation marks, or wrap in markdown. If user asks for specific terms, please include them in the schema. Only output valid JSON schema",
          temperature: 0,
          // model: "gpt-4", // gpt-4 generally has much better responses
          ...inputConfig,
          // these MUST BE TRUE, or your code will break (*.result)
          showResult: true, 
          verbose: true, 
        })
      }
      let output = await getResult(input);
      let counter = 0, tries = inputConfig?.tries || 5;

      let jsonOutput = null;
      while (!jsonOutput && counter < 5) {
        try {
          jsonOutput = JSON.parse(output.result);
          // should probably use Zod for this...
          let check = await prompt(`Check if this is a valid JSON schema: ${JSON.stringify(jsonOutput)}. Only output "true" or "false"`)
          if(check !== "true") throw new Error("Not a valid JSON schema")
        } catch (e) {
          counter++;
          if (counter < tries) {
            output = await getResult(input);
          }
        }
      }
      if (!jsonOutput) {
        throw new Error(`[toSchema] Failed to parse JSON after ${tries} attempts`);
      }

      if (!inputConfig?.verbose)
        return jsonOutput;
      else {
        output['numTries'] = counter + 1;
        output['json'] = jsonOutput;
        return output;
      }
    }

    // uses funcall() and toSchema() as guardrails to extract data from a prompt
    const extract = async (input, inputConfig) => {
      let verbose = inputConfig?.verbose;
      inputConfig.verbose = true; // for sub-calls

      let res = await toSchema(input, inputConfig);
      let jsonSchema = res.json;
      let fName = "data_extract";
      let desc = "extracts data from string";
      let required = Object.keys(jsonSchema?.properties).filter(key => {
        if (jsonSchema?.properties[key].required) {
          delete jsonSchema?.properties[key].required
          return true
        }
      })
      jsonSchema['required'] = required
      // console.log('[extract] json schema:', jsonSchema, JSON.stringify([{
      //   "name": fName,
      //   "description": desc,
      //   "parameters": {
      //     ...jsonSchema,
      //     "required": required,
      //   },
      // }], 0, 2), )
      res =  await funcall(input, {
        ...inputConfig,
        functions: [{
          "name": fName,
          "description": desc,
          "parameters": {
            ...jsonSchema,
          },
        }],
        function_call: fName,
        verbose: true, // this HAS to be true, or your code will break (*.result)
      });

      if (verbose) {
        res['jsonSchema'] = jsonSchema
        return res
      } else {
        return res?.json
      }
    }






    // ingesting data and getting embeddings
    // storing embeddings
    // returning embeddings
    const embed = async (input, system) => { };

    // uses embeddings and ?? vector to get n closest/related items
    const related = async (input, system) => { };

    // agent stuff

    // export all fns
    return {
      // --- vars
      config, messages,

      // --- fns
      prompt, ask,
      chat,
      moderation,
      json, funcall, toSchema, extract,
      embed,
      related,
      getTokenLen,
    }
  } catch(e) {
    console.log('[llm] error', e)

    // throw it up to the API server
    throw(e)
  }
}

