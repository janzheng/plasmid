
import { PROMPT_QA_EXAMPLES } from './promptQAExamples.js'
import { PROMPT_INSTRUCTIONS } from './promptInstructions.js'




/* 

  fQuery

*/
import { fQuery } from '$plasmid/modules/llm/fquery'

// export let sessionHistory = []

export async function getFutureQuery(currentUserInput, sessionHistory=[]) {
  let fq = await fQuery().prompt([
    "You are WeChatGPT+, a search assistant that surpassed Google. Current date: 2030-06-06. Do not repeat stuff from previous answers. Be creative and futuristic. " + PROMPT_INSTRUCTIONS,
    PROMPT_QA_EXAMPLES[0].q,
    PROMPT_QA_EXAMPLES[0].a,
    ...sessionHistory.map(sesh => [sesh.q.substring(0, 100), sesh.a.substring(0, 400)]).flat(),
    currentUserInput,
  ], {
    model: "gpt-3.5-turbo-16k"
  })
  let res = { text: fq };

  // this should be done @ server-level to prevent leakage / allow resetting
  // because the prompts and instructions are so large,
  // we need to truncate the session history
  // or just clear it every time
  // longer lengths with -16k
  // sessionHistory = []
  // sessionHistory.push({
  //   q: currentUserInput,
  //   a: res?.text
  // })

  return res
}













/* 

  Legacy

  // 9/10/23 - some has been changed to accommodate newer openai dev api reqs


*/


// import OpenAI from "openai";

// const openai = new OpenAI({
//   // organization: process.env.OPENAI_ORGANIZATION,
//   apiKey: process.env.OPENAI_API_KEY
// });

// let _inputPrefix = "Do not repeat stuff from previous answers. Be creative and futuristic. Input prompt begins: "
// const promptMessagesInitial = [
//   {
//     role: "system",
//     content: "You are WeChatGPT+, a search assistant that surpassed Google. Current date: 2030-06-06"
//   },
//   {
//     role: "user",
//     content: PROMPT_INSTRUCTIONS + '\n\n' + _inputPrefix + PROMPT_QA_EXAMPLES[0].q
//   },
//   {
//     role: "assistant",
//     content: PROMPT_QA_EXAMPLES[0].a
//   }
// ]




// export async function getFuture({
//   userId, currentUserInput, sessionHistory
// }) {
//   try {
//     userId = "future-" + userId
//     currentUserInput = currentUserInput.substring(0, 100)
//     let output = await getResponse(PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput, userId)
//     console.log('getFuture Response', userId, currentUserInput, output)

//     return { 'text': output }
//   } catch (err) {
//     // _err(err)
//     console.error('[api/future/getFuture]', err.message || err?.response?.data)
//     // throw new Error(500, err.message)
//   }
// }



// export const constructPromptChatGPT = (PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput, inputPrefix = _inputPrefix, promptMessages = promptMessagesInitial) => {
//   try {
//     for (let i = 1; i < PROMPT_QA_EXAMPLES.length; i++) {
//       promptMessages.push({
//         role: "user",
//         content: inputPrefix + PROMPT_QA_EXAMPLES[i].q
//       })
//       promptMessages.push({
//         role: "assistant",
//         content: PROMPT_QA_EXAMPLES[i].a
//       })
//     }
//     for (let i = Math.max(0, sessionHistory.length - 2); i < sessionHistory.length; i++) {
//       promptMessages.push({
//         role: "user",
//         content: inputPrefix + sessionHistory[i].q.substring(0, 100)
//       })
//       promptMessages.push({
//         role: "assistant",
//         content: sessionHistory[i].a.substring(0, 300)
//       })
//     }
//     promptMessages.push({
//       role: "user",
//       content: inputPrefix + currentUserInput
//     })
//     return promptMessages
//   } catch (err) {
//     console.error('constructPromptChatGPT', err)
//   }
// }


// export const getResponse = async (PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput, userId) => {
//   const messages = constructPromptChatGPT(PROMPT_INSTRUCTIONS, PROMPT_QA_EXAMPLES, sessionHistory, currentUserInput)
//   console.log('getResponse message length:', messages.length)

//   // get the length of all messages.content strings
//   let messageLength = 0
//   for (let i = 0; i < messages.length; i++) {
//     messageLength += messages[i].content.length
//   }
//   console.log('getResponse message length:', messageLength)


//   if (currentUserInput.startsWith("!mock")) {
//     await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
//     if (currentUserInput === "!mock1") return "moikka"
//     return "Petting dogs is a great way to relax and de-stress. But why pet just any dog when you can pet a pedigree? Pedigree's line of robotic dogs are the perfect companion for any petting session. They come in all shapes and sizes, and they're programmed to respond to your touch. Plus, they never need to be walked or fed. Pedigree. Pet the future.";
//   }
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo-16k",
//       messages: messages,
//       max_tokens: 256,
//       temperature: 0.4
//     });
//     let message = response.choices[0].message.content.replaceAll("\n", " ").trim()
//     // let message = "fake message"
//     console.log('response message:', message)
//     return message
//   } catch (error) {
//     // const errorMessage = error.response ? (error.response.status + error.response.data) : error.message
//     // const requestWasMalformed = error.response?.status == "400"

//     // Set server status as red for some time
//     // const timeoutSeconds = 10*61000 // errorMessage.match(/.*(R|r)ate ?limit.*/) ? 61000 : 3600000
//     // if (serverStatusGreen && !requestWasMalformed) {
//     //     serverStatusGreen = false
//     //     setTimeout(() => {
//     //         serverStatusGreen = true
//     //     }, timeoutSeconds)
//     // }

//     console.log('chat error:', error)

//     throw error
//   }
// }