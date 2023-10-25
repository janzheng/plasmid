
// branched from https://github.com/baobabKoodaa/future/blob/master/server.js 
// https://hwchase17.github.io/langchainjs/docs/modules/prompts/example_selectors
// https://github.com/Conner1115/LangChain.js-LLM-Template/tree/main/lib

// add pdf-parse?

// import { ChatOpenAI } from "langchain/chat_models";
// import { LLMChain } from "langchain/chains";
import { getReturnResponse } from "$plasmid/modules/llm/utils";

// import {
//   SystemMessagePromptTemplate,
//   HumanMessagePromptTemplate,
//   ChatPromptTemplate,
// } from "langchain/prompts";






// JUST THE AUTHOR INFO, without fixing or getting the body
// the body text is returned as raw data
export async function extractAbstractMetadata(
  input, // <--- this is where you send stuff in
  {
    system, instructions, firstPromptMsg,
    modelName="gpt-3.5-turbo", 
    temperature=0.7
  } = {}) {

  try {
    // using {{ text }} prevents it from interpreting "text" as placeholder — necessary for JSON prompts
    instructions = instructions || `
    Extract abstract into JSON object:
- turn Salmonella to *Salmonella*
- No emails, citations, or links unless explicit in text.
- Title: Apply italics, bold, superscript, subscripts, and GFM Markdown for gene/species/bacterial (e.g. Salmonella)/latin words/names. 
- Convert any HTML to Markdown
- Authors: Convert affiliations to numbers. Format: "Name ^1,2,3 *" (affiliations, * for corresponding author). Use numbers not letters (a,b) for multiple authors. Put each author on a new line. Don't use "and" to concatenate authors. Remove all "and" from affiliations.
- Authors: "Eunshin Jo 1 and Sangryeol Ryu 1,2 *" becomes:
    Eunshin Jo 1
    Sangryeol Ryu 1,2 *
- Affiliations: Numbered markdown list.
- Correspondence: Use provided emails, else blank.
- Keywords: Create a comma-separated list of keywords from the body text. Remove any duplicates. Remove markdown symbols.
- Add Github-flavored markdown styling for italicized words, bold, superscripts, and subscripts.
- For "bodyStartStr", provide the first 50 characters of the abstract body without any changes, HTML formatting, or Markdown conversion. Ensure this string matches the input exactly.
Example:
{{
"title": "A novel *Helicobacter* pylori phage..." (Output title as Markdown. Italicize species like Acinetobacter in Markdown.),
"authors": "Ferreira, R. ^1,3 (If only one author, use "author name ^1*")
Figueiredo, C. ^3,4,5
Melo ^1,2"
"affiliations": "1. CEB, University of Minho \n2. INSA, Lisbon \n3. i3S, Porto \n4. Ipatimup \n5. Faculty of Medicine, University of Porto" (remove "a" and "b" from affiliations and convert to numbers)
"correspondence": "S. Hayes. Email: sidney.hayes@usask.ca"
"keywords": "Helicobacter pylori, phage, virulence, antibiotic resistance, biofilm"
"bodyStartStr": (Provide the first 50 characters of the abstract body exactly as in the input, without any changes, HTML formatting, or Markdown conversion.)
}}

- Place each author on a new line. 
- Add space before ^ in authors
- Remove letters (a, b, ... ) in output
- Output valid JSON; escape newlines like "\\n"
- bodyStartStr: do not convert to markdown. this string must match input. Do not add formatting to this string.
`

    system = system || `You're a helpful assistant to a microbiologist. ` + instructions;
    // `You're a helpful assistant to a microbiologist. You're given a microbiology abstract, and you need to extract the following information from the abstract into a proper JSON in a JS code block:`;
    firstPromptMsg = firstPromptMsg || "Abstract: {text}";

    // const model = new ChatOpenAI({
    //   modelName,
    //   openAIApiKey: process.env.OPENAI_API_KEY,
    //   temperature,
    // });

    // const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
    //   SystemMessagePromptTemplate.fromTemplate(system), 
    //   HumanMessagePromptTemplate.fromTemplate(firstPromptMsg),
    // ]);
    
    // const chain = new LLMChain({
    //   llm: model,
    //   prompt: chatPromptTemplate,
    // });

    let res = { text: '(LLM answer will go here)' }

    // since we're getting just the metadata, we don't need the full body; 
    // cut input off at 1000 characters
    let fullInput = input;
    input = input.substring(0, 1000);

    console.log('>>>> Getting answer from OpenAI...')
    console.time();
    // res = await chain.call({
    //   text: input,
    // });
    console.timeEnd();
    console.log('[GPT] \n---------->>>>>\n\nOutput:', res, '\n\n<<<------------');

    let output = getReturnResponse(res);

    // get the raw "bodyStartStr" if it exists
    if(output?.result?.bodyStartStr) {
      // find the position of output.result.bodyStartStr in input, and get the rest of the input text
      let bodyStartStr = output.result.bodyStartStr.substring(0,50);
      let bodyStartStrPos = fullInput.indexOf(bodyStartStr);
      let bodyText
      if (bodyStartStrPos >= 0)
        bodyText = fullInput.substring(bodyStartStrPos);

      output.result.bodyTextRaw = bodyText;
    }

    if (output?.result?.authors) {
      // simplfying the output / UX of authors and affiliations
      // authors end up looking like this: Sidney Hayes^1*"; use regex to add a space before ^ if missing
      // update: we just replace the ^ with a space, then replace double spaces
      output.result.authors = output.result.authors.replace(/\^/g, ' ');
      output.result.authors = output.result.authors.replace(/  /g, ' ');
      // if authors are comma-separated by accident (with optional space), replace with a new line \n
      output.result.authors = output.result.authors.replace(/,\s/g, '\n');
      output.result.affiliations = output.result.affiliations.replace(/\d\.\s/g, '');
    }

    return output

  } catch (err) {
    // _err(err)
    console.error('[llm/extractAbstractMetadata]', err.message || err?.response?.data)
    // throw error(500, err.message)
  }
}












export async function extractAbstractBody(input, // <--- this is where you send stuff in
  {
    system, instructions, firstPromptMsg,
    modelName = "gpt-3.5-turbo",
    temperature = 0.2
  } = {}) {

  try {
    instructions = instructions || `
    Extract this full abstract text in to a JSON object:
- turn Salmonella to *Salmonella*
- No emails, citations, or links unless explicit in text.
- Convert any HTML to Markdown
- Body: Use Markdown for Body Text. No links, headers "##", or markdown links to citations. Convert any HTML to Markdown.
- Add proper markdown styling for italicized words, bold, superscripts, and subscripts.
- Don't add headers like "## Abstract". Just return the body text.

Example:
{{
"body": (Use Markdown for Body Text. No links, headers "##", or markdown links to citations. Add proper markdown styling for italicized words, bold, superscripts, and subscripts. Convert any HTML to Markdown)
}}
`
    // using {{ text }} prevents it from interpreting "text" as placeholder — necessary for JSON prompts


    system = system || `You're a helpful assistant to a microbiologist. ` + instructions;
    // `You're a helpful assistant to a microbiologist. You're given a microbiology abstract, and you need to extract the following information from the abstract into a proper JSON in a JS code block:`;
    firstPromptMsg = firstPromptMsg || "Abstract: {text}";

    // const model = new ChatOpenAI({
    //   modelName,
    //   openAIApiKey: process.env.OPENAI_API_KEY,
    //   temperature,
    // });

    // const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
    //   SystemMessagePromptTemplate.fromTemplate(system),
    //   HumanMessagePromptTemplate.fromTemplate(firstPromptMsg),
    // ]);

    // const chain = new LLMChain({
    //   llm: model,
    //   prompt: chatPromptTemplate,
    // });

    // let res = { text: '(LLM answer will go here)' }

    // console.log('[abstract]: Calling GPT...')
    // console.time();
    // res = await chain.call({
    //   text: input,
    // });
    // console.timeEnd();
    // console.log('[GPT] \n---------->>>>>\n\nOutput:', res, '\n\n<<<------------');

    // let output = getReturnResponse(res);
    // return output

  } catch (err) {
    // _err(err)
    console.error('[llm/extractAbstract]', err.message || err?.response?.data)
    // throw error(500, err.message)
  }
}

