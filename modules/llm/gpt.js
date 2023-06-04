/* 

  OpenAI GPT functions (no langchain)
  - Generalized GPT playground used to understand vanilla GPT
  - inspired by https://github.com/baobabKoodaa/future/blob/master/server.js  
  
  - TODO
    - implement various prompt / message formats, with examples
      - Q&A from baobabKoodaa/future
      - ReAct (Observation / Thought / Action) loop (without langchain)
    - inject actions from API / scraper / database on Action stage
    - add pdf-parse helper

*/


import { json } from '@sveltejs/kit';
import { Configuration, OpenAIApi } from "openai";

// import PROMPT_QA_EXAMPLES from "./prompt-qa-examples.js";
// const PROMPT_INSTRUCTIONS = fs.readFileSync('prompt-instructions.txt', 'utf8');

const configuration = new Configuration({
  // organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);






export let sessionHistory = []
// pushSessionHistory()
// export const pushSessionHistory = (sessionHistory, input, output) => {
//   sessionHistory.push({
//     u: input,
//     a: output
//   })
//   return sessionHistory
// }

// resetSessionHistory()
// export const resetSessionHistory = (sessionHistory) => {
//   sessionHistory = []
//   return sessionHistory
// }





// getPrompt() Constructs the chat GPT prompt
// for ChatCompletion, sets system, user + optional prompt instructions, prefixes and examples,, and assistant messages
// then backfills uers / assistant messages from session history
// systemContent: instructions for who the system is; e.g. what character it's playing
// promptInstructions: longer prompt instructions, examples, keywords + terms; all examples + terms should go in here, including new information or summaries of previous information
// inputPrefix: prefix for user input; used for every user input; e.g. "Do not repeat stuff from previous answers"
// exampleHistory: EXAMPLE array of objects with u (user) and a (assistant) properties
// sessionHistory: array of objects with u (user) and a (assistant) properties
export const getChatMessages = ({ system = "You are a helpful assistant", promptInstructions = '', inputPrefix = '', exampleHistory = [], sessionHistory = [], input }) => {
  let messages = []

  // system message
  messages.push({
    role: "system",
    content: system
  })


  if (promptInstructions) {
    messages.push({
      role: "user",
      content: promptInstructions
    })
  }

  let history = [...exampleHistory, ...sessionHistory]
  if (history && history.length > 0) {
    for (const [i, row] of history.entries()) {
      messages.push({
        role: "user",
        content: inputPrefix + row?.u
      })
      messages.push({
        role: "assistant",
        content: inputPrefix + row?.a
      })
    }
  }

  messages.push({
    role: "user",
    content: inputPrefix + input
  })

  return messages
}


export const llm = async ({ messages, model = "gpt-3.5-turbo", max_tokens = 256, temperature = 0.4 }) => {
  try {
    const response = await openai.createChatCompletion({
      model,
      messages: messages,
      max_tokens,
      temperature,
    });
    return response.data.choices[0].message.content.replaceAll("\n", " ").trim()
  } catch (error) {

    console.log('[error] llm:', error)
    throw error
  }
}






export async function getChat({ chatSettings, sessionHistory, useHistory = true, showSummary = false }) {
  try {
    let {
      system, promptInstructions, inputPrefix, exampleHistory, input, user,
      model, max_tokens = 256, temperature
    } = chatSettings

    let messages = getChatMessages({ system, promptInstructions, inputPrefix, exampleHistory, sessionHistory, input: input||user })

    if (useHistory && !sessionHistory) {
      sessionHistory = messages
    }

    console.log('[getChat] messages', chatSettings)
    // let output = `fake output here for tesing;`
    let output = await llm({ messages, model, max_tokens, temperature })

    if (useHistory) {
      sessionHistory.push({
        u: input,
        a: output
      })
    }

    // // let summaryMsg = getChatMessages({ system, sessionHistory, input: "get the summary of the conversation in one line" })
    // // let summary = await llm({ messages: summaryMsg, model, max_tokens, temperature })

    
    return {
      sessionHistory,
      output,
      summary: showSummary && {
        summaryMsg,
        summary,
      }
    }
  } catch (err) {
    // _err(err)
    console.error('[api/llm]', err.message || err?.response?.data)
    // throw error(500, err.message)
  }
}




// import this in a +server.js file
export async function _POST({ request }) {
  try {
    let chatSettings = await request.json()
    console.log("responding to options", chatSettings)
    return json(await getChat({ chatSettings }))
  } catch (err) {
    console.error('[api/llm]', err.message || err?.response?.data)
  }
}
