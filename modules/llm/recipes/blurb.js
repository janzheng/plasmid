
// branched from https://github.com/baobabKoodaa/future/blob/master/server.js 
// https://hwchase17.github.io/langchainjs/docs/modules/prompts/example_selectors
// https://github.com/Conner1115/LangChain.js-LLM-Template/tree/main/lib

// add pdf-parse?

import { json } from '@sveltejs/kit';
import { OpenAI } from "langchain/llms";
import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Document } from "langchain/document";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

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

export async function getChatBlurb(input) {
  try {

    let system = input?.system || "You're a helpful summarizer. Here are examples, separated by '---': {examples} {instructions}";
    const instructions = `Please write a summary of the following text: {textInput}. Format the summary in markdown. Add a link to the original article as a markdown link in the summary, aroun the a key part of the summary. Generate up to 3 keywords that represent the text, in a string array. Output the summary in JSON in the following format:
    {
      "Link": (link),
      "Summary": (summary),
      "Keywords": (keywords)
    }`;
    let template = "{textInput}";
    let modelName = input?.modelName || "gpt-4"
    const textInput = `Link: ${input?.link} | Text: ${input?.text}`;

    // variables
    const examples = `:
Example:

Link: https://www.bloomberg.com/press-releases/2021-03-18/lysando-ag-and-amicogen-inc-forge-a-strategic-partnership
Text: Lysando AG and AMICOGEN Inc. forge a strategic partnership
March 18, 2021 at 6:00 PM GMT+11
Share this article
          Lysando AG and AMICOGEN Inc. forge a strategic partnership

  PR Newswire

  BALZERS, Liechtenstein and JINJU, South Korea, March 18, 2021

BALZERS, Liechtenstein and JINJU, South Korea, March 18, 2021 /PRNewswire/ --
The fight against the rise of resistant bacteria and the global
antibiotic-crisis is enforced and accelerated with the strategic partnership
of AMICOGEN and Lysando AG. The two specialist's partnership creates decisive
synergies.

Lysando is the global leader in the development of antimicrobial proteins. The
so-called Artilysin®s replace antibiotics, particularly against highly
resistant bacteria. On top Artilysin®s are employed to restore and optimise
the natural human microbiome.

The public quoted Korean company AMICOGEN is a leading manufacturer of
technical enzymes and has well established distribution channels in Asia,
including China. For both partners this close cooperation serves their
long-term goals well.

"Due to the close cooperation and exchange on know-how in regards to the
highly specialised manufacturing we reduce the costs and the time to market
for our licensees. In addition, this alliance opens the Artilysin® technology
access to the Asian markets. As a result, we accelerate the conversion of our
R&D achievements into market products," says the President of Lysando AG,
Count Markus Matuschka de Greiffenclau.

Due to the strategic partnership with AMICOGEN, Lysando offers its licensees
the entire process from the development of Artilysin®s, to scale-up and "Good
Manufacturing Practice" (GMP).

"We are enthusiastic about the Artilysin® technology, because Artilysin®
offers a feasible solution to the global problem of resistant bacteria. We are
determined to invest into an Artilysin® production facility. In addition,
AMICOGEN acquired a license for the Artilysin® based wound-spray for Asia.
With this acquisition we will step-up our value creation chain in Asia,
including the Chinese market." remarks the President of AMICOGEN, Yong Chul
Shin.

Both partners cooperating on the solution of the antibiotic's crises will show
impact.

About Amicogen Inc.

Amicogen, Inc., (KOSDAQ: 092040.KQ)  develops, produces and markets specialty
enzymes and functional food ingredients. The company offers special
biocatalysts, enzyme-based new functional materials, health foods, and
consumer products.

About Lysando AG

Lysando AG is market-leader for antimicrobial proteins, so-called Artilysin®s.

Artilysin®s are a new class of molecules which show a high resistance
stability and are at the same time microbiome – and environmentally friendly.
Artilysin®s can be employed in all fields bacteria present a problem like
Medical Devices, Human Pharmaceutics, Animal Health and Consumer Care.

Summary: Liechtenstein company Lysando AG and Korean company Amicogen Inc. have forged a [strategic partnership](https://www.bloomberg.com/press-releases/2021-03-18/lysando-ag-and-amicogen-inc-forge-a-strategic-partnership). Lysando creates Artilysin®s, which are phage lysin-based antimicrobial proteins, and partnering with Amicogen will allow them to access the Asian market."

Keywords: Biotech news, Partnership

---

Link: https://www.rcinet.ca/en/2021/03/22/researchers-test-spray-to-prevent-covid-19-infection
Text: Researchers test spray to prevent COVID-19 infection
By Lynn Desjardins | 
english@rcinet.ca
Posted: Monday, March 22, 2021 12:14
Last Updated: Monday, March 22, 2021 12:22
FacebookTwitterEmailPrint
A Canadian company is about to start testing on animals a throat and nasal spray that would stop infection by COVID-19 and its variants. Cytophage Technologies Inc. says this would have an advantage over vaccines by eliminating asymptomatic cases and the concern about passing the virus on to other people. It also would be a benefit for the estimated one in ten Canadians who are afraid of needles. 

The company uses bacteriophages which target and destroy bacterial cells. Cytophage researchers have found a way to make synthetic phages that destroy specific bacteria or viruses. 

“Unlike vaccines that trigger an immune response only after the virus has flooded the body’s systems, the synthetic bacteriophage in our spray will stimulate the production of protective antibodies in the nose and throat that then instantly get to work killing the virus when it enters the body. These antibodies also move throughout the body, allowing for general immunity faster,” said Steven Theriault, CEO and Chief Science Officer at Cytophage. “Essentially this means the person using our product would not develop COVID-19 which, in turn, would prevent the spread of COVID  to others.”


Steven Theriault works to make synthetic phages that destroy specific bacteria or viruses. (Cytophage Technologies)

Phages could fight super bugs
Cytophage has obtained $15 million in total funding from private investors in Canada and the U.S. It generates phage products to combat bacterial infections like salmonella and E. coli in animals. It is using its technology to fight antibiotic-resistant bacteria and viral threats.

The COVID-19 project is the first effort it seeks to apply to humans. However, if it can successfully apply its technology on antibiotic-resistant bacteria in humans that would be a boon to mankind. The World Health Organization predicts 10 million people a year could be killed by such superbugs by the year 2050 and calls it one of the biggest threats to global health, food security, and development today.

Summary: Cytophage Technologies, a Canadian phage biotech company, is [about to start testing on animals a throat and nasal spray](https://www.rcinet.ca/en/2021/03/22/researchers-test-spray-to-prevent-covid-19-infection/?fbclid=IwAR1u8Or1tDh0xZFVNTAF3XU36Nat9AKtT2A0wJoU9z0UAHAjYhvBVws8lDc) that would stop infection by COVID-19 and its variants. The idea is that the synthetic phage in their spray will stimulate the production of protective antibodies in the nose and throat.
Keywords: Biotech news, COVID
      
---

Link: https://www.mdpi.com/1999-4915/13/3/506
Text: Bacteriophage (phage) taxonomy has been in flux since its inception over four decades ago. Genome sequencing has put pressure on the classification system and recent years have seen significant changes to phage taxonomy. Here, we reflect on the state of phage taxonomy and provide a roadmap for the future, including the abolition of the order Caudovirales and the families Myoviridae, Podoviridae, and Siphoviridae. Furthermore, we specify guidelines for the demarcation of species, genus, subfamily and family-level ranks of tailed phage taxonomy. View Full-Text
Summary: Dann Turner (University of the West of England) and colleagues published a new paper in Viruses entitled [A Roadmap for Genome-Based Phage Taxonomy](https://www.mdpi.com/1999-4915/13/3/506).
Keywords: Research paper, Taxonomy

      `;

    const model = new ChatOpenAI({
      // modelName: modelName || "gpt-3.5-turbo",
      modelName: modelName || "gpt-4",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7
    });
    const prompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(system),
      // new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate(template),
    ]);
    // don't need this for now
    // const chain = new ConversationChain({
    //   // memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
    //   prompt: prompt,
    //   llm: model,
    // });
    const chain = new LLMChain({
      prompt: prompt,
      llm: model,
    });





    let res = { text: 'LLM Bypassed for testing' }

    // console.log('Calling reviewer:', persona)
    console.log('>>>> Getting answer from OpenAI...')
    console.time();
    res = await chain.call({
      instructions,
      examples,
      textInput,
    });
    console.timeEnd();
    console.log('---------->>>>>\n\nOutput:', res?.text, '\n\n<<<------------');

    // only true for json responses
    try {
      let data = JSON.parse(res?.text);
      return {
        Link: input?.link,
        Summary: data?.Summary, // defined by prompt
        Keywords: data?.Keywords, // defined by prompt
      }
    } catch (e) {
      // return the text if not json
      console.log('!!!! failed JSON parsing ------<<<<')
      return {
        Link: input?.link,
        Summary: "Summary failed to parse",
        Keywords: "sad face",
      }
    }
  } catch (err) {
    // _err(err)
    console.error('[llm/reviewer]', err.message || err?.response?.data)
    // throw error(500, err.message)
  }
}




// import this in +server.js
// export async function _POST({ request }) {
//   try {
//     let {
//       persona,
//       system,
//       text
//     } = await request.json()

//     let res = await getReview({ persona, text })

//     return json({
//       result: res,
//       persona,
//       text
//     })
//   } catch (err) {
//     // _err(err)
//     console.error('[llm/chainapi]', err.message || err?.response?.data)
//     // throw error(500, err.message)
//   }
// }





