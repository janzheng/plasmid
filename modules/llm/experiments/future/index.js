

import { Configuration, OpenAIApi } from "openai";
import { PROMPT_QA_EXAMPLES } from './promptQAExamples.js'
import { PROMPT_INSTRUCTIONS } from './promptInstructions.js'



const configuration = new Configuration({
  // organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

let serverStatusGreen = true




// const constructPromptDaVinci = (PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput) => {
//     const qaToString = qa => `Input: ${qa.q}\n\nOutput: ${qa.a}\n\n`
//     let prompt = `${PROMPT_INSTRUCTIONS}\n\n`
//     prompt += PROMPT_QA_EXAMPLES.map(qaToString).join("")
//     if (sessionHistory?.length > 0) {
//         prompt += sessionHistory.slice(sessionHistory.length - 1).map(qaToString).join("")
//     }
//     prompt += `Input: ${currentUserInput}\n\n`
//     prompt += `Output:`
//     return prompt
// }

let _inputPrefix = "Do not repeat stuff from previous answers. Be creative and futuristic. Input prompt begins: "
const promptMessagesInitial = [
  {
    role: "system",
    content: "You are WeChatGPT+, a search assistant that surpassed Google. Current date: 2030-06-06"
  },
  {
    role: "user",
    content: PROMPT_INSTRUCTIONS + '\n\n' + _inputPrefix + PROMPT_QA_EXAMPLES[0].q
  },
  {
    role: "assistant",
    content: PROMPT_QA_EXAMPLES[0].a
  }
]




export async function getFuture({
  userId, currentUserInput, sessionHistory
}) {
  try {
    userId = "future-" + userId
    currentUserInput = currentUserInput.substring(0, 100)
    let output = await getResponse(PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput, userId)
    console.log('getFuture Response', userId, currentUserInput, output)

    return { 'text': output }
  } catch (err) {
    // _err(err)
    console.error('[api/future/getFuture]', err.message || err?.response?.data)
    // throw new Error(500, err.message)
  }
}



export const constructPromptChatGPT = (PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput, inputPrefix = _inputPrefix, promptMessages = promptMessagesInitial) => {
  try {
    for (let i = 1; i < PROMPT_QA_EXAMPLES.length; i++) {
      promptMessages.push({
        role: "user",
        content: inputPrefix + PROMPT_QA_EXAMPLES[i].q
      })
      promptMessages.push({
        role: "assistant",
        content: PROMPT_QA_EXAMPLES[i].a
      })
    }
    for (let i = Math.max(0, sessionHistory.length - 2); i < sessionHistory.length; i++) {
      promptMessages.push({
        role: "user",
        content: inputPrefix + sessionHistory[i].q.substring(0, 100)
      })
      promptMessages.push({
        role: "assistant",
        content: sessionHistory[i].a.substring(0, 300)
      })
    }
    promptMessages.push({
      role: "user",
      content: inputPrefix + currentUserInput
    })
    return promptMessages
  } catch (err) {
    console.error('constructPromptChatGPT', err)
  }
}


export const getResponse = async (PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput, userId) => {
  const messages = constructPromptChatGPT(PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput)
  console.log('getResponse message length:', messages.length)

  // get the length of all messages.content strings
  let messageLength = 0
  for (let i = 0; i < messages.length; i++) {
    messageLength += messages[i].content.length
  }
  console.log('getResponse message length:', messageLength)


  if (currentUserInput.startsWith("!mock")) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
    if (currentUserInput === "!mock1") return "moikka"
    return "Petting dogs is a great way to relax and de-stress. But why pet just any dog when you can pet a pedigree? Pedigree's line of robotic dogs are the perfect companion for any petting session. They come in all shapes and sizes, and they're programmed to respond to your touch. Plus, they never need to be walked or fed. Pedigree. Pet the future.";
  }
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 256,
      temperature: 0.4
    });
    let message = response.data.choices[0].message.content.replaceAll("\n", " ").trim()
    // let message = "fake message"
    console.log('response message:', message)
    return message
  } catch (error) {
    // const errorMessage = error.response ? (error.response.status + error.response.data) : error.message
    // const requestWasMalformed = error.response?.status == "400"

    // Set server status as red for some time
    // const timeoutSeconds = 10*61000 // errorMessage.match(/.*(R|r)ate ?limit.*/) ? 61000 : 3600000
    // if (serverStatusGreen && !requestWasMalformed) {
    //     serverStatusGreen = false
    //     setTimeout(() => {
    //         serverStatusGreen = true
    //     }, timeoutSeconds)
    // }

    console.log('chat error:', error)

    throw error
  }
}