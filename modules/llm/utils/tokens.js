


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
let tokenizer = getEncoding('cl100k_base')

export function getTokenStrLen(input, encoding='cl100k_base') {
  if(encoding != 'cl100k_base')
    tokenizer = getEncoding(encoding)
  return new Uint32Array(tokenizer.encode(input)).length
}

export function getTokenLen(input) {
  if (typeof input === 'string') {
    return getTokenStrLen(input);
  } else if (Array.isArray(input)) {
    // console.log('getTokenLen input:', {input});
    let tokens = input.map(message => message.content && message.content.length>0 && getTokenStrLen(message.content));
    let total = tokens.reduce((a, b) => a + b, 0);
    return {
      messages: input.length,
      tokens: tokens,
      total: total
    };
  }
  
}