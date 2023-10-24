/* 

  All fns w/ OpenAI should be here; 
  makes it easier to swap to others in the future


  this has been updated to work with openai@^4.5.0
  - PREVIOUS ONES HAVE A SLIGHTLY DIFFERENT API!

*/

// import OpenAI from 'openai';
import OpenAI from "openai";


// messages look like [{role:"user/assistant", content:"some prompt"}]
export const getChatCompletion = async (messages, _config) => {
  let config = _config || { model: "gpt-3.5-turbo", max_tokens: 256, temperature: 0.4, loud: true }
  const openai = _config?.openai || new OpenAI({
    apiKey: _config?.apiKey || process.env.OPENAI_API_KEY
  });
  let OPENAI_API_KEY = config?.apiKey || process.env.OPENAI_API_KEY

  console.log('[getChatCompletion] messages:', messages)
  try {
      // if (!response.ok) {
      //   const err = await response.json()
      //   throw new Error(err.error.message)
      // }

      if (config.stream) {
        // these are for SSE
        // easier to reflect the event-stream from the API
        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(
            {
              messages: messages,
              model: config.model,
              max_tokens: config.max_tokens,
              temperature: config.temperature,
              stream: config.stream
            }
          )
        })

        if (!chatResponse.ok) {
          const err = await chatResponse.json()
          throw new Error(err.error.message)
        }

        // chatResponse.on('end', () => {
        //   console.log('chatResponse', chatResponse);
        //   // Do your cleanup here
        // });

        console.log('---> [OpenAI] stream:', config.stream)
        return {
          chatResponse,
          results: new Response(chatResponse.body, {
            headers: {
              'Content-Type': 'text/event-stream'
            }
          })
        }
      } else {
        // regular response; get all the parts of the response
        let requestObject = {
          messages: messages,
          // white list all callers just in case
          model: config.model,
          max_tokens: config.max_tokens,
          temperature: config.temperature,
          stream: config.stream,
          functions: config.functions,
          function_call: config.function_name,
        }

        if (config.loud) console.log('---> [OpenAI] requestObject:', JSON.stringify(requestObject, 0, 2))
        const response = await openai.chat.completions.create(requestObject);

        
        // console.log('---> [OpenAI] response:', response)
        if (config.loud) console.log('---> [OpenAI] messages:', messages)
        if (config.loud) console.log('---> [OpenAI] FULL response:', JSON.stringify(response, 0, 2))

        // console.log('====>', response.choices[0])
        // results are either the message content or function call output
        let results = response.choices[0]?.message?.content?.replaceAll("\n", " ")?.trim() || response.choices[0].message.function_call;
        // let results = { // do we want to be explicit?
        //   content: response.choices[0]?.message?.content?.replaceAll("\n", " ")?.trim(),
        //   function_call: response.choices[0].message.function_call,
        // }
        if (config.loud) console.log('---> [OpenAI] result:', results, typeof results)
        // return {results, response}

        // automatically just return the first choice's message, since this is the norm
        return { results, message: response.choices[0]?.message }

      }

  } catch (error) {

    console.log('[llm] error:', error)
    throw error
  }
}






















/* 

  Simple thing for managing chat history

  Note: originally this was supposed to be a Class, but then I changed my mind

  OpenAI chat history generally looks like:

  [
    {role:"system", content:"some prompt"}
    {role:"user/assistant", content:"some prompt"}
    {role:"user/assistant", content:"some prompt"}
    {role:"user/assistant", content:"some prompt"}
  ]

  Things this should NOT do:
  - token checking
  - moderation
  - anything past managing the array of chats

*/
export const initMessages = (
    messages = [], 
    {
      system="You are a helpful assistant", 
    } = {}) => {

  if (typeof messages === 'string') {
    // init with a string returns a well-formatted arr for OpenAI API
    messages = [
      { role: 'system', content: system },
      { role: 'user', content: messages },
    ];
    return messages
  }

  // was gonna do other stuff here but nah lol
  return messages
}



export const setSystemMessage = (messages, content) => {
  // MUTATES MESSAGES BUT ALSO RETURNS IT!!
  //
  // Modify the system function to add or update a system prompt based on content
  // adds a system prompt based on content if it doesn't exist, to the front of the array
  // if it does exist, sets it to the new content
  // Check if a system prompt already exists in the chat history
  const systemPromptIndex = messages.findIndex((message) => message?.role === "system");

  if (systemPromptIndex === -1) {
    // If a system prompt doesn't exist, add it to the front of the array
    messages.unshift({ role: "system", content });
  } else {
    // If a system prompt exists, update its content
    messages[systemPromptIndex].content = content;
  }
  // system = content
  return messages
}
// add to the chat history
export const addUserMessage = (messages, content, role = "user") => {
  messages.push(
    { role, content }
  )
  return messages
}

export const addAssistantMessage = (messages, content, role = "assistant") => {
  messages.push(
    { role, content }
  )
  return messages
}

// this is the assistant's request for a function call
export const addFunctionCallMessage = (messages, message, role = "assistant") => {
  messages.push(
    { role, content: null, function_call: {name: message?.function_call?.name, arguments: message?.function_call?.arguments }}
  )
  return messages
}