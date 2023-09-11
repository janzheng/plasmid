
// branched from https://github.com/baobabKoodaa/future/blob/master/server.js 
// https://hwchase17.github.io/langchainjs/docs/modules/prompts/example_selectors
// https://github.com/Conner1115/LangChain.js-LLM-Template/tree/main/lib






/* 

  fQuery

*/
import { fQuery } from '$plasmid/modules/llm/fQuery'

export async function getBlurbQuery({
  link, text, modelName,
} = {}) {
  
  try {
    let system = "You're a helpful summarizer! Respond in markdown. Do not wrap in backticks. Use markdown links where appropriate.";
    let textInput = `Link: ${link} | Text: ${text}`;
    textInput = textInput.substring(0, 8000)

    const instructions = `Generate a JSON object from this text: {textInput}. 
    - A "summary" field: a short 300 character Markdown summary around 200 characters describing the article that includes a link to the abstract in the appropriate context
    - In the "summary" field always create a link around a phrase in the middle of the text, to the provided link. Example: Some [important text](provided link) is highlighted. Don't add a link to the end. If you can't find a good place to add a link, add it to the first three words.
    - A "keywords" field with an array containing 3 relevant keywords to the text.
    - Generate a JSON object that looks like this:
    {
      "Summary": "(summary with a key phrase in summary linking to the provided link, with markdown)",
      "Keywords": ["keyword1", "keyword2", "keyword3"]
    }

    `;

    let fq = await fQuery().json([
      system + "; " + instructions,
      textInput,
    ], {
      model: modelName || "gpt-3.5-turbo-16k", // gpt-4?
    })
    
    console.log('getBlurbQuery results :::: ', fq)
    return {...fq, Link: link}
  } catch (e) {
    console.error('[reviewertwo/getReviewQuery] error:', e)
  }
}






















/* 

  Legacy

*/
// add pdf-parse?

import JSON5 from 'json5'

import { json } from '@sveltejs/kit';
// import { OpenAI } from "langchain/llms";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { Document } from "langchain/document";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models";
import { LLMChain } from "langchain/chains";

import { getReturnResponse } from "../utils"

import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";


// TODO
// add pdf-parse?
// add recursivetext

/* 

  input: {
    modelName: string
    system: string
    link: string
    text: string
  }

  these are both sent in the {textInput} variable

*/







import OpenAI from "openai";
import { getPrompt } from "../templates/blurb-prompt.js"

const openai = new OpenAI({
  // organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY
});


export async function getSummary(text, temperature = 0.8, top_p = 0.9, max_tokens = 200, frequency_penalty = 0.5, presence_penalty = 0.5,) {
  try {
    if (text.length > 4000) {
      text = text.substring(0, 4000)
    }
    
    const prompt = `Give a short summary from the following Markdown text: \n\n${text}`
    const completion = await openai.createCompletion({
      model: "text-davinci-002",
      prompt,
      temperature: temperature,
      max_tokens: max_tokens,
      top_p: top_p,
      frequency_penalty: frequency_penalty,
      presence_penalty: presence_penalty,
    });


    // console.log('completion:', completion.data)
    console.log('[getSummary] Results:', completion, completion.choices[0].text)
    return completion.data.choices[0].text
  } catch (err) {
    console.error(err.message || err)
  }
}



export async function getBlurb(link, text, temperature = 0.8, top_p = 0.9, max_tokens = 200, frequency_penalty = 0.5, presence_penalty = 0.5,) {
  try {
    if (text.length > 8000) {
      text = text.substring(0, 8000)
    }
    let prompt = getPrompt(link, text);

    const completion = await openai.createCompletion({
      model: "text-davinci-002",
      prompt,
      temperature: temperature,
      max_tokens: max_tokens,
      top_p: top_p,
      frequency_penalty: frequency_penalty,
      presence_penalty: presence_penalty,
      stop: ["}", "},"],
    });


    let obj = `{
      "Link": "${link}",
      ${completion.data.choices[0].text}
    }`

    // console.log('completion:', completion.data)
    console.log('[blurb] Results:', obj)
    return JSON5.parse(obj)
  } catch (err) {
    console.error(err.message || err)
  }
}



















export async function getChatBlurb(input) {
  try {

    let system = input?.system || "You're a helpful summarizer! Examples: {instructions} ";
    const instructions = `Generate a JSON object from this text: {textInput}. 
    - A "summary" field: a short 300 character Markdown summary around 200 characters describing the article that includes a link to the abstract in the appropriate context
    - In the "summary" field always create a link around a phrase in the middle of the text, to the provided link. Example: Some [important text](provided link) is highlighted. Don't add a link to the end. If you can't find a good place to add a link, add it to the first three words.
    - A "keywords" field with an array containing 3 relevant keywords to the text.
    - Generate a JSON object that looks like this:
    {
      "Summary": "(summary with a key phrase in summary linking to the provided link)",
      "Keywords": ["keyword1", "keyword2", "keyword3"]
    }
    
    `;
    let template = "{textInput}";
    let modelName = input?.modelName || "gpt-3.5-turbo" || "gpt-4"
    let textInput = `Link: ${input?.link} | Text: ${input?.text}`;
    textInput = textInput.substring(0, 4000)

    // this example actually messes the output up
    const examples = `
Examples JSON object. Not how the links are generated mid-summary:

{
  "Summary": Liechtenstein company Lysando AG and Korean company Amicogen Inc. have forged a [strategic partnership](https://www.bloomberg.com/press-releases/2021-03-18/lysando-ag-and-amicogen-inc-forge-a-strategic-partnership). Lysando creates Artilysin®s, which are phage lysin-based antimicrobial proteins, and partnering with Amicogen will allow them to access the Asian market.",
  "Keywords": ["Biotech news", "Partnership"]
}
      `;

    const model = new ChatOpenAI({
      // modelName: modelName || "gpt-3.5-turbo",
      modelName: modelName,
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: input?.temperature || 0.2,
    });
    const prompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(system),
      HumanMessagePromptTemplate.fromTemplate(template),
    ]);
    const chain = new LLMChain({
      prompt: prompt,
      llm: model,
    });


    let res = { text: '(results)' }

    // console.log('Calling reviewer:', persona)
    console.log('[chat-blurb]: Calling GPT...')
    console.time();
    res = await chain.call({
      instructions: instructions, // + ' ' + examples,
      textInput,
    });
    console.timeEnd();
    
    
    let output = getReturnResponse(res);
    console.log('[chat-blurb]: GPT Response:', res, output);
    if (output.type === 'application/json') {
      return {
        Link: input?.link,
        Summary: output.value?.Summary,
        Keywords: output.value?.Keywords,
      }
    } else {
      return {
        Link: input?.link,
        Summary: output.value,
        Keywords: null,
      }
    }
  } catch (err) {
    // _err(err)
    console.error('[chat-blurb]', err.message || err?.response?.data)
    // throw error(500, err.message)
  }
}




