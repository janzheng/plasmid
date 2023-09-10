

// // example of a langchain ChatOpenAI
// // https://hwchase17.github.io/langchainjs/docs/modules/chat_models/overview/

// import { ChatOpenAI } from "langchain/chat_models";
// import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
// import {
//   SystemMessagePromptTemplate,
//   HumanMessagePromptTemplate,
//   ChatPromptTemplate,
// } from "langchain/prompts";




// const chat = new ChatOpenAI({ temperature: 0 });

// const response = await chat.call([
//   new HumanChatMessage(
//     "Translate this sentence from English to French. I love programming."
//   ),
// ]);

// console.log(response);



// response = await chat.call([
//   new SystemChatMessage(
//     "You are a helpful assistant that translates English to French."
//   ),
//   new HumanChatMessage("Translate: I love programming."),
// ]);

// console.log(response);





// const responseC = await chat.generate([
//   [
//     new SystemChatMessage(
//       "You are a helpful assistant that translates English to French."
//     ),
//     new HumanChatMessage(
//       "Translate this sentence from English to French. I love programming."
//     ),
//   ],
//   [
//     new SystemChatMessage(
//       "You are a helpful assistant that translates English to French."
//     ),
//     new HumanChatMessage(
//       "Translate this sentence from English to French. I love artificial intelligence."
//     ),
//   ],
// ]);

// console.log(responseC);






// // templates to encapsulate reusable tokens

// const translationPrompt = ChatPromptTemplate.fromPromptMessages([
//   SystemMessagePromptTemplate.fromTemplate(
//     "You are a helpful assistant that translates {input_language} to {output_language}."
//   ),
//   HumanMessagePromptTemplate.fromTemplate("{text}"),
// ]);



// const responseA = await chat.generatePrompt([
//   await translationPrompt.formatPromptValue({
//     input_language: "English",
//     output_language: "French",
//     text: "I love programming.",
//   }),
// ]);

// console.log(responseA);





// const chain = new LLMChain({
//   prompt: chatPrompt,
//   llm: chat,
// });

// const responseB = await chain.call({
//   input_language: "English",
//   output_language: "French",
//   text: "I love programming.",
// });

// console.log(responseB);






// // states + conversation history

// const chatPrompt = ChatPromptTemplate.fromPromptMessages([
//   SystemMessagePromptTemplate.fromTemplate(
//     "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
//   ),
//   new MessagesPlaceholder("history"),
//   HumanMessagePromptTemplate.fromTemplate("{input}"),
// ]);

// const chain = new ConversationChain({
//   memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
//   prompt: chatPrompt,
//   llm: chat,
// });

// const responseD = await chain.call({
//   input: "hi from London, how are you doing today",
// });



// Streaming

// const chatStreaming = new ChatOpenAI({
//   streaming: true,
//   callbackManager: CallbackManager.fromHandlers({
//     handleLLMNewToken(token: string) {
//       console.log(token);
//     },
//   },
// });

// const responseD = await chatStreaming.call([
//   new HumanChatMessage("Write me a song about sparkling water."),
// ]);