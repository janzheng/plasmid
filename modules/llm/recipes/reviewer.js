
// branched from https://github.com/baobabKoodaa/future/blob/master/server.js 
// https://hwchase17.github.io/langchainjs/docs/modules/prompts/example_selectors
// https://github.com/Conner1115/LangChain.js-LLM-Template/tree/main/lib

// add pdf-parse?

import { OpenAI, ChatOpenAI } from "langchain/llms";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Document } from "langchain/document";
import { CharacterTextSplitter } from "langchain/text_splitter";



// TODO
// add pdf-parse?
// add recursivetext

/* 

  input: {
    persona: 'SCOR', // 'Yoda; review the paper fairly and with a lot of detail, in the speech style of Yoda'
    text: 'This is a test'
  }

*/

export async function getReview(input) {
  try {
    // let {
    //   system, promptInstructions, inputPrefix, exampleHistory, input,
    //   model, max_tokens = 256, temperature = 0.7
    // } = await request.json()

    const system = input?.system || "You're a decorated professor at the top of the field, reviewing research papers.";
    const template = "{instructions} {persona} {textInput}";

    // variables
    const instructions = "If you don't know, admit you don't know. Do not break out of character and don't explain yourself. Answer as the following character: {persona}"

    let persona = input?.persona
    let persona2

    // testing only
    // input.persona = 'SCOR'
    // const persona = "Reviewer 2: Harsh critic who always finds something wrong with your paper"
    if (input?.persona.includes('SCOR')) {
      persona = `Review the manuscript by filling in the following template, in JSON format. Score from 1 (lowest) to 5 (highest):
      Please format the output in JSON proper JSON formatting. Make sure to end with a "}": 
      {
        "scor": {
          "significance": {
            "score":"(score)",
            "explanation":(text)"
          },
          "clarity": {
            "score":"(score)",
            "explanation":(text)"
          },
          "originality": {
            "score":"(score)",
            "explanation":(text)"
          },
          "rigor": {
            "score":"(score)",
            "explanation":(text)"
          },
        },
        "nextlevel": "(Explain areas to improve of the manuscript, and ways to take it to the next level)"
      }`;

      // too slow, but this gets better output
      persona2 = `Senior PI: Your job is to improve the manuscript's chances to get accepted at the best journal possible. Review the manuscript by filling in the following template, in JSON format:

      Break first person responses. Please format the output in JSON format, as follows: 
      {
        "scor": {
          "significance": {
            "score":"(score from 1 (lowest) to 5)",
            "explanation":(200 character reasoning)"
          },
          "clarity": {
            "score":"(score from 1 (lowest) to 5)",
            "explanation":(200 character reasoning)"
          },
          "originality": {
            "score":"(score from 1 (lowest) to 5)",
            "explanation":(200 character reasoning)"
          },
          "rigor": {
            "score":"(score from 1 (lowest) to 5)",
            "explanation":(200 character reasoning)"
          },
        },
        "strengths": "(Explain strengths of the manuscript)",
        "weaknesses": "(Explain areas to improve of the manuscript)",
        "future": "(Steps to take to get the paper to the next level of journal; 1200 character reason)"
      }
      `;

    }
    const text = input?.text;

    // const modelName = input?.text || "gpt-3.5-turbo"
    const modelName = input?.text || "gpt-4"

    // const model = new OpenAIChat({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.9 });

    const model = new OpenAI({
      modelName: modelName,
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7
    });

    const prompt = new PromptTemplate({
      system: system,
      template: template,
      inputVariables: ["instructions", "persona", "journal", "textInput"],
    });



    let res = { text: 'LLM Bypassed for testing' }
    const chain = new LLMChain({ llm: model, prompt: prompt });

    // console.log('Calling reviewer:', persona)
    console.log('>>>> Getting answer from OpenAI...')
    console.time();
    res = await chain.call({
      instructions,
      persona,
      textInput: text
    });
    console.timeEnd();
    console.log('---------->>>>>\n\nOutput:', res?.text, '\n\n<<<------------');

    // only true for json responses
    try {
      return JSON.parse(res?.text);
    } catch (e) {
      // return the text if not json
      console.log('!!!! failed JSON parsing ------<<<<')
      return res?.text || 'Not available'
    }
  } catch (err) {
    // _err(err)
    console.error('[llm/reviewer]', err.message || err?.response?.data)
    // throw error(500, err.message)
  }
}




// import this in +server.js
export async function _POST({ request }) {
  try {
    let {
      persona,
      system,
      text
    } = await request.json()

    let res = await getReview({ persona, text })

    return json({
      result: res,
      persona,
      text
    })
  } catch (err) {
    // _err(err)
    console.error('[llm/chainapi]', err.message || err?.response?.data)
    // throw error(500, err.message)
  }
}






/* 

  This example uses the OG OpenAI API to generate a response to a prompt, instead of Langchain
  - as an exercise / example

*/

import { getChat } from '../gpt.js'

// add options to switch Reviewer 1, 2, 3, and other characters

// create function for characters that's injectable into the chatSettings


let defaultChatSettings = {
  system: "You're a decorated professor at the top of the field, reviewing research papers.",
  promptInstructions: "You are reviewing research papers and abstracts. If you don't know, say you don't know. Do not break out of character. Do not explain yourself. Answer as the following character: ",
  inputPrefix: "",
  exampleHistory: "",
  input: "",
  // model: "gpt-4",
}

export const getReviewGpt = async (persona, input) => {
  let chatSettings = { ...defaultChatSettings }

  // chatSettings.promptInstructions = `${defaultChatSettings.promptInstructions} ${persona}`
  chatSettings.promptInstructions = defaultChatSettings.promptInstructions + persona;

  if (persona.includes('Evaluator')) {
    // add some custom stuff here
    chatSettings.promptInstructions = `You're a consultant hired to improve the manuscript's chances to get accepted at the best journal. Review the manuscript based "SCOR" and give a rating between 1 (lowest) and 5 (highest) on the following metrics: Significance, Clarity, Originality, Rigor. Give an evaluation of what work needs to be done for the manuscript to be elevated to the next level of journal. Output format: 
    
    Significance: {score} - {200 character reason}
    Clarity: {score} - {200 character reason}
    Originality: {score} - {200 character reason}
    Rigor: {score} - {200 character reason}
    Journal Most Likely to accept: {journal name} - {600 character reason}
    Steps to take to get the paper to the next level of journal: {1200 character reason}`
  }


  // limit input to 4000 characters
  input = input.slice(0, 4000)

  chatSettings.input = input
  // console.log('wtf', chatSettings)
  let { output } = await getChat({ chatSettings, useHistory: false })
  return output
}