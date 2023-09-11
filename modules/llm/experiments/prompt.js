
/* 

  @9/11: Realy old; doesn't work anymore; use fQuery instead

*/
// Very basic LLM 

import { ChatOpenAI } from "langchain/chat_models";
import { LLMChain } from "langchain/chains";
import { getReturnResponse } from "$plasmid/modules/llm/";

import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";



export async function prompt(
  {
    prompt, user, input, // the user message
    system = "You are a helpful assistant",
    modelName = "gpt-3.5-turbo",
    temperature = 0.7,
    streaming = false,
  } = {}) {
    

  try {
    const model = new ChatOpenAI({
      modelName,
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature,
    });

    prompt = user || input || prompt // support multi keywords

    const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(system),
      HumanMessagePromptTemplate.fromTemplate(prompt),
    ]);

    const chain = new LLMChain({
      llm: model,
      prompt: chatPromptTemplate,
    });

    console.log('>>>> Getting answer from OpenAI...')
    console.time();
    const res = await chain.call();
    console.timeEnd();
    console.log('[GPT] \n---------->>>>>\n\nOutput:', res, '\n\n<<<------------');

    let output = getReturnResponse(res);
    return output

  } catch (err) {
    console.error('[llm/prompt]', err.message || err?.response?.data)
  }
}













// use this with SSE, e.g. /demo/chatty

export async function promptStream (
  {
    prompt, user, input, // the user message
    system = "You are a helpful assistant",
    modelName = "gpt-3.5-turbo",
    temperature = 0.7,
    streaming = false,
  } = {}) {


  try {
    const model = new ChatOpenAI({
      modelName,
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature,
      streaming,
      callbacks: [
        {
          handleLLMNewToken(token) {
            process.stdout.write(token);
          },
        },
      ],
    });

    prompt = user || input || prompt // support multi keywords

    const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(system),
      HumanMessagePromptTemplate.fromTemplate(prompt),
    ]);

    const chain = new LLMChain({
      llm: model,
      prompt: chatPromptTemplate,
    });

    let output = await chain.call()

    return output?.text

  } catch (err) {
    console.error('[llm/promptStream]', err.message || err?.response?.data)
  }
}