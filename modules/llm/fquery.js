

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
  - [for JSON and data extract, and for reasoning]: add a constraint checker to ensure valid generation. On violation, inject what was generated and the rule violation, and regenerate.
      - inject JSON parse errors into the last message, OR add a GPT-3 as a double checker to say whether it's valid or not, if not, write a reason why not and pass that into the last message, and re-evaluate

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

let loud = true;

import { getTokenLen } from './utils/tokens.js'
// import { getMessagesFromInput } from './utils/index.js'
import { getChatCompletion, initMessages, setSystemMessage, addUserMessage, addFunctionCallMessage, addAssistantMessage } from './utils/openai.js'
import { replaceKeys, parseMetadata } from '../../utils/helpers.js'

let addonLibrary = {
  "french": "Reply in French",
  "chinese": "Reply in Chinese (simplified)",
  "haiku": "Reply in Haiku",
  "stepby": "Let's think step by step, then give your final answer.",
  "json": "Only reply in correct JSON. Start your response with '{' and end with '}'. Do not wrap your answer in backticks. Do not explain yourself. Add any free-form text replies to 'message', e.g. { 'message': 'your reply' }",
  "json-cota": "Only reply in correct JSON. Start your response with '{' and end with '}'. Do not wrap your answer in backticks. Do not explain yourself. Start with a 'reasoning' array where you write out the reasoning, thinking step by step, each step an item in the array. Then, add a 'solution' key where you write out the solution as a string.",
  "json-thinking": "Only reply in correct JSON. Start your response with '{' and end with '}'. Do not wrap your answer in backticks. Do not explain yourself. Please think through the math with a 'thinking' key where you think through step by step before you answer in an 'answer' key.",
  "code": "Do not wrap your answer in backticks. Do not explain yourself.",
  "no-explain": "Do not explain yourself.",
  "no-backticks": "Do not wrap your answer in backticks.",
  "unwrap-results": "Do not wrap your entire response in a 'results:' key.",
  "reasoning": "Use headings or subheadings to highlight the main points or sections of the content. Utilize concrete examples or anecdotes to elucidate concepts effectively. Support claims and arguments with statistics or evidence for greater persuasiveness. Establish coherence by using transitions and connectors to link ideas and paragraphs. Avoid redundancy by employing synonyms or paraphrasing when necessary. Engage in reflective, logical, and reasoned thinking prior to delivering.",
  "witty": "Maintain a witty, imaginative, and informative tone while keeping the conversation natural."
}

const NUM_RETRIES = 2;


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

        let messages = []
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
          if (!_config?.skipSystemMessage) {
            messages = setSystemMessage(messages, input[0])
            start = 1
          }

          if (input?.system || _config?.system) {
            if (messages?.[0]?.role !== 'system') {
              // can provide config.system instead
              messages = setSystemMessage(messages, input?.system || _config?.system)
              // start = 1
            }
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
          if (_config?.system) {
            messages = [...messages, ...input];
            messages = setSystemMessage(messages, _config?.system);
          } else {
            messages = input;
          }

        } else if (typeof input === 'object' && Object.keys(input).length > 0) {
          // input is a JS object with at least 1 key
          /*
            {
              system: "You are hilarious!",
              input: "Tell me a banana joke"
            }
          */
          if (input?.system || _config?.system) {
            messages = setSystemMessage(messages, input?.system || _config?.system)
          }
          if(input?.input) {
            messages = addUserMessage(messages, input?.input)
          }
        } else {
          // input is a string
          // add the input string either as a regular text string
          // or a s an array of properly-formatted openai chatCompletion objects
          if (_config?.messages) {
            messages = addUserMessage(_config?.messages, input);
          } else {
            messages = initMessages(input, _config);
          }
        }
      

        if (_config?.replace) {
          // replaces {{name}} with the user's name from replace object: {name: "Jan"}
          // replaceOptions is the metadata, like dictionary, start/end symbols, etc
          messages = messages.map(message => {
            message.content = replaceKeys(message.content, _config?.replace, _config?.replaceOptions);
            return message;
          });
        }
        
        if (_config?.addons) {
          let addons = _config?.addons
          messages = messages.map((message, i) => {
            if (_config?.addonOptions?.onlySystem && message.role !== 'system') {
              // only apply addon to system
              return message
            }
            else if (_config?.addonOptions?.lastMessage && i < messages.length-1) {
              // skip if not the last message
            }
            else {
              if(Array.isArray(addons)) {
                addons.forEach(addon => {
                  // Check if addon exists in the addons object and replace it with the corresponding value
                  let addonValue = addonLibrary[addon] ? addonLibrary[addon] : addon;
                  message.content = `${message.content} | ${addonValue}`;
                })
              } else {
                // addon is just a string in this case
                message.content = `${message.content} | ${addons}`;
              }
            }
            return message;
          });
        }

        if(loud) {
          console.log('[assembled message + config]: \nmessages:', messages, '\nconfig:', _config) // this is really useful; keep it around!!
        }

        let initTokenCount = getTokenLen(messages)
        // console.log('token count::', initTokenCount)
        if (_config?.tokenLimit && initTokenCount.total > _config?.tokenLimit) {
          throw new Error(`Token limit exceeded. Tokens: ${initTokenCount} / Limit: ${_config?.tokenLimit}`)
        }

        let { results, message } = await getChatCompletion(messages, { ..._config })

        if (_config?.stream) {
          // todo: figure out how to capture this later on, on load-end
          return results // response.body
        }

        if (_config?.functions && message?.function_call?.name) {
          messages = addFunctionCallMessage(messages, message)
        } else {
          messages = addAssistantMessage(messages, results)
        }

        if(_config.verbose) {
          let returnObj = {
            messages,
            initTokenCount,
          }
          if (_config?.showMessage && message) {
            returnObj['message'] = message
          }
          if (_config?.showResults && results) {
            returnObj['results'] = results
          }
          return returnObj
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
      let _config = { ...config, ...inputConfig };
      return await prompt(input, {..._config,
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
          system: "You are a code generator. Only respond in correct JSON. Start your response with '{' and end with '}'. Do not explain your answers. Do not use quotation marks, or wrap in markdown backticks. Do not wrap your entire response in a 'results:' key.",
          temperature: 0,
          // model: "gpt-4", // gpt-4 generally has much better responses
          ...inputConfig,
          // these MUST BE TRUE, or your code will break (*.results)
          verbose: true, 
          // optional; these make response really large
          showResults: true, // this is what we're parsing!
          showMessage: false,
        })
      }
      let output = await getResult(input);
      let counter = 0, tries = inputConfig?.tries || NUM_RETRIES;

      let jsonOutput = null;
      while (!jsonOutput && counter < NUM_RETRIES) {
        try {
          jsonOutput = JSON.parse(output.results);
        } catch (e) {
          console.error(`[json] try:[${counter}] Output not parseable:`, output.results)
          counter++;
          if (counter < tries) {
            if (typeof (input) == "string") input += " Please write your response in correct JSON"
            if (Array.isArray(input)) input[input.length - 1].content += " Please write your response in correct JSON"
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
        delete output['results']; // this is the same as .json, but not parsed
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
          system: "You are a code generator. Only use the functions you have been provided with.",
          // functions: [], // send in schema definitions
          // function_call: {"name": "get_n_day_weather_forecast" } // force use
          // max_tokens: 4000, // this messes with response length / tokens
          temperature: 0,
          // model: "gpt-3.5-turbo-16k", // use 16k for better context length, or gpt-4 for 8k length
          model: "gpt-3.5-turbo", // use 16k for better context length, or gpt-4 for 8k length
          ...inputConfig,
          // these MUST BE TRUE, or your code will break (*.results)
          showResults: true, 
          verbose: true, 
          // optional
          showMessage: true,
        })
      }

      let output = await getResult(input);
      let counter = 0, tries = inputConfig?.tries || NUM_RETRIES;
      let jsonOutput = null;

      if (!output.results.arguments) {
        jsonOutput = {
          message: output.results
        } // no functions to call = no arguments; this is most likely a message
      }

      while (!jsonOutput && counter < NUM_RETRIES) {
        try {
          jsonOutput = JSON.parse(output.results.arguments);
        } catch (e) {
          console.error(`[funcall] Error`, {e});
          counter++;
        }
      }
      if (!jsonOutput) {
        console.error('[funcall] Not JSON output', {output, jsonOutput})
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





    // convenience function that
    // takes functions, and uses funcall to run the function 
    // availableFunctions is an object w; { fnName: { schema, fn }}
    // all args are sent in one obj (first arg)
    // showReply = respond w/ LLM
    const runFunc = async (input, { inputConfig, availableFunctions, replyMode }) => {
      if (!availableFunctions) {
        throw new Error('[llm/json] no available functions specified')
      }

      let functions = Object.values(availableFunctions).map(fn => fn.schema)
      functions = functions.filter(fn => fn)

      const responseMessage = await funcall(
        input,
        {
          functions: functions,
          function_call: "auto",
          tries: 2,
          verbose: true,
          ...inputConfig,
        }
      )
      
      let messages = responseMessage.messages;
      const functionName = responseMessage.results?.name;
      const functionToCall = availableFunctions[functionName]?.fn;
      let functionArgs, functionResponse
      let reply


      if (functionName) {
        // only get function responses if there's a function deemed to be called
        // otherwise functionResponse and reply will be empty
        functionArgs = JSON.parse(responseMessage.results.arguments);

        console.log('>>> Function Calling:', functionName, functionArgs)

        if (replyMode == 'args') {
          // reply w/ function call response w/o running anything
          return {
            name: functionName,
            args: functionArgs,
            // reply: responseMessage.results,
          }
        }

        functionResponse = await functionToCall(functionArgs);
        // messages.push(responseMessage.message) // add assistant's message back in
        // Step 4: send the info on the function call and function response to GPT
        messages.push({
          "role": "function",
          "name": functionName,
          "content": JSON.stringify(functionResponse),
        });  // extend conversation with function response

        
        if(loud) {
          console.log('---- responseMessage:', { availableFunctions, responseMessage, msgs: responseMessage.messages, message: responseMessage.message, functionResponse, functionArgs })
        }
        // TODO: CLEAN THIS UP!
        if (replyMode == 'json') {
          reply = await json(messages, {
            ...inputConfig,
            verbose: true,
            addons: ["json-thinking", "unwrap-results"],
            addonOptions: {
              lastMessage: true,
            }
          });  // get a new response from GPT where it can see the function response
          messages = reply.messages // update messages
        }
        if (replyMode == 'prompt') {
          reply = await prompt(messages, {
            ...inputConfig,
            verbose: true,
            // addons: ["stepby"],
            // addonOptions: {
            //   lastMessage: true,
            // }
          });  // get a new response from GPT where it can see the function response
          messages = reply.messages // update messages
        }
      }

      let returnObj = {
        reply, // includes all the messages and latest message
      }

      if(reply) {
        returnObj['reply'] = reply;
      }
      if (!reply) {
        // only show these if not showing reply (no "replyMode"), otherwise lots of data
        returnObj['messages'] = messages
      }

      if (functionName) {
        returnObj['function'] = {
          name: functionName,
          args: functionArgs,
          response: functionResponse, // either return the response or LLM message
        }
      }
      if(!functionName && responseMessage.message) {
        returnObj['results'] = responseMessage.message
      }

      return returnObj
    }



    // wrapper to write continuous function calling
    // until there are no more function that can responsd
    const runFuncLoop = async (input, { inputConfig, availableFunctions }) => {
      let messages
      if(!Array.isArray(input)) {
        messages = [input]
      } else {
        messages = input
      }

      let continueLoop = true;
      let funcLoopResults

      let num = 0
      while (continueLoop) {
        funcLoopResults = await runFunc(messages, {
          availableFunctions,
          inputConfig: {
            skipSystemMessage: true,
            ...inputConfig,
          }
        })
        messages = funcLoopResults?.messages;
        // console.log('runFuncLoop', num, funcLoopResults)
        num = num + 1

        if (funcLoopResults.results) {
          continueLoop = false
        }
      }

      // build / parse all function responses
      if (funcLoopResults.messages) {
        let functionResponses = {}
        let functionMessages = funcLoopResults.messages.filter(msg => msg.role == 'function')
        functionMessages.forEach(msg => {
          functionResponses = { ...functionResponses,
            [msg.name]: JSON.parse(msg?.content)?.results || null
          }
        })
        funcLoopResults['functionResponses'] = functionResponses
      }


      return funcLoopResults
    }




    // generator for function calling object, using fn calling and json schema to convert a prompt to a function call object w/ json schema
    const toSchema = async (input, inputConfig) => {
      const getResult = async (input) => {
        return await prompt(input, {
          system: "You are a software and data engineer. Extract all terms according to valid JSON Schema. Start your response with '{' and end with '}'. Do not explain yourself. Do not use quotation marks, or wrap in markdown. If user asks for specific terms, please include them in the schema. Only output valid JSON schema",
          temperature: 0,
          // model: "gpt-4", // gpt-4 generally has much better responses
          ...inputConfig,
          // these MUST BE TRUE, or your code will break (*.result)
          showResults: true, 
          verbose: true, 
        })
      }
      let output = await getResult(input);
      let counter = 0, tries = inputConfig?.tries || NUM_RETRIES;

      let jsonOutput = null;
      while (!jsonOutput && counter < NUM_RETRIES) {
        try {
          jsonOutput = JSON.parse(output.results);
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
        console.error('[[toSchema] Failed to parse JSON after ${tries} attempts', output.results)
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

      // jsonSchemaProp is just the { properties: ...} of a schema
      let jsonSchema = inputConfig?.['jsonSchema']?.['parameters'] || inputConfig?.['jsonSchema']
      let res

      if(!jsonSchema) {
        // get a inferred schema
        res = await toSchema(input, inputConfig);
        jsonSchema = res.json;
      }

      // console.log('---->>>', jsonSchema)
      let fName = "data_extract";
      let desc = "extracts data from string";
      let required = Object.keys(jsonSchema?.properties).filter(key => {
        if (jsonSchema?.properties[key].required) {
          delete jsonSchema?.properties[key].required
          return true
        }
      })
      jsonSchema['required'] = required
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
      runFunc, runFuncLoop,
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

