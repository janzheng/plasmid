


/* 

// gpt-tokens causing trouble on Fly servers

import { GPTTokens } from 'gpt-tokens'

export let getTokens = ({
  model = 'gpt-3.5-turbo',
  messages,
  system = 'You are a helpful assistant',
  user = '',
}) => {

  const gptTokens = new GPTTokens({
    model,
    messages: messages || [
      { 'role': 'system', 'content': system },
      { 'role': 'user', 'content': user },
    ],
  })

  return {
    usd: gptTokens.usedUSD,
    tokens: gptTokens.usedTokens,
  }
}


export let getTokenStrLen = (str, model = 'gpt-3.5-turbo') => {

  const gptTokens = new GPTTokens({
    model,
    messages: [
      { 'role': 'user', 'content': str },
    ],
  })

  return gptTokens.usedTokens
  // return {
  //   usd: gptTokens.usedUSD,
  //   tokens: gptTokens.usedTokens,
  // }
}

*/

import { getEncoding } from 'js-tiktoken'

// TODO: make this configurable
const tokenizer = getEncoding('cl100k_base')

export function getTokenStrLen(input) {
  return new Uint32Array(tokenizer.encode(input)).length
}