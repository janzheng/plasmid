
/* 

  Bacterial straincorrect

  This is a simple straincorrect function that uses the Levenshtein distance algorithm to find the closest word in the dictionary to the word being corrected.

  Design Goals
  - work with paragraph text! Shouldn't need to specify if paragraph or specific bacterial name
  - if paragraph has multiple names, should correct ALL of them
  - correct misspellings of "Escherichia coli" in a paragraph
  - correct misspellings of "E. cali" in a paragraph
  - expand E. coli to Escherichia coli
  - contract Escherichia coli to E. coli
  - correct + wrap italic markdown around any bacterial names in paragraph text 
  - if given strainText, get a list of all strains that match that text

  Algorithm
  0. Deal w/ + fix contracted names first: replace contracted instances of "e coli" to "E. coli"
    - look for pattern "e col" or "e. coli" and do a replacement
  1. Fix expanded strain name errors
  2. Fix genus (single word) errors 
  3. (optional) Contract; don't contract genus-only like "Dickeya" or "Dickeya spp."
  4. (optional) Expand; e.g. E. coli -> Escherichia coli
    - this is a bit more complicated, because we need to know the genus of the strain
    - we can do this by looking at the genus of the first strain in the paragraph
    - if the genus is not in the paragraph, then we can't expand
  4. (future?) turn "Dickeya" into "Dickeya spp." 


  
  Test terms
  - I like bananas and e. coli
  - I really like e coli and p. aeruginosa and k pneumoniae?? I like them all!
  - I really like e coli and p. aerugonosa and k pneumoniae?? I like them all! But what about klebsiellr pneumonia?? or camyplobacter jejuni???
  - I like big e coli and E. coli and escherickia coli but c jejuni is also pretty good. Dickeaa is good too I guess
  - ESKAPE pathogens are: E. coli, S. aureus, K. pneumoniae, A. baumannii, P. aeruginosa, and E. faecium
  - (note: co-pilot is wrong, e. coli is not an ESKAPE pathogen)
  - Regular: http://localhost:3051/utility/api/straincorrect?mode=contract&input=I%20really%20like%20e%20coli%20and%20p.%20aerugonosa%20and%20k%20pneumoniae??%20I%20like%20them%20all!%20But%20what%20about%20klebsiellr%20pneumonia??%20or%20camyplobacter%20jejuni???
  - Contract: http://localhost:3051/utility/api/straincorrect?mode=contract&input=Expanded%20ESKAPE%20pathogen%20names%20are:%20Escherichia%20coli,%20Staphylococcus%20aureus,%20Klebsiella%20pneumoniae,%20Acinetobacter%20baumannii,%20Pseudomonas%20aeruginosa,%20and%20Enterococcus%20faecium
  - Fix + Expand - provides a "strainText" that can be used to expand the genus name: http://localhost:3051/utility/api/straincorrect?mode=expand&input=Full%20names%20of%20ESKAPE%20pathogens%20are:%20Enterobacter%20spp,%20S.%20aoreus,%20K.%20pneumoniaae,%20A.%20baumani,%20P.%20aerugnosea,%20and%20E.%20feceium&strainText=Klebsiella%20pneumoniae,%20Enterococcus%20faecium,%20Staphylococcus%20aureus,%20Pseudomonas%20aeruginasal,%20Acinetobacter%20bamanii,Dickeya

  


  Future:
  - semantic breakdown / identify all genus / strains in paragraph, reply as a list of genus / strains or as an object with genus / strains as keys and their positions in the paragraph as values (e.g. { "E. coli": [1, 3, 5], "K. pneumoniae": [2, 4] }) 
  
]

*/

import leven from 'leven'
// import strains from './strains.json'

export async function loadStrains() {
  const response = await fetch('https://f2.phage.directory/yawnxyz/strains.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const strains = await response.json();
  return strains;
}

loadStrains().then(data => strains = data);

export const getStrains = (shorten = true) => {
  return strains.data
}

// returns an array of strain names based on type
// default (paired): ["Escherichia coli", "Klebsiella pneumoniae"]
// single: ["Escherichia", "coli"]
// contracted: ["E. coli", "K. pneumoniae"]
// genus: ["Escherichia", "Klebsiella"]
export const getStrainNames = (type) => {
  // returns full name of array pairs 
  let namesArr = getStrains().map(strain => strain.name)

  // split up genus and species into individual words
  if (type == 'single') {
    namesArr = namesArr.join(' ').split(' ') // splits up bacteria names into genus and species separately
    // get unique array of words for wordDict
    namesArr = [...new Set(namesArr)]
  } else if (type == 'contracted') {
    // treat genus and species as one word
    // add contracted versions, e.g. Escherichia coli -> E. coli
    namesArr = namesArr.map(strain => strain.replace(/(\w)\w+\s/g, '$1. '))
  } else if (type == 'genus') {
    // just get a list of genus
    namesArr = namesArr.map(strain => strain.split(' ')[0])
    // get unique array of words for wordDict
    namesArr = [...new Set(namesArr)]
  }

  // console.log('getStrainNames array', namesArr.slice(0, 10), 'type:', type)
  return namesArr
}

// gets strain names from text by matching against a dictionary of strain names
// returns an array of strain names
// future: maybe we should return an array of objects with the strain name and the index of the strain name in the text
// dict should have paired strain names, contracted ones AND genus names — this makes matching easy
export const getStrainNamesFromText = (text, dict) => {
  let strainNames = []
  dict.map(strainName => {
    // exclude genus-only names from pairs that already exist, e.g. if "Klebsiella pneumoniae" already exists, don't report "Klebsiella" as a strain name
    if (text.includes(strainName) && strainNames.filter(strain => strain.includes(strainName)).length == 0) {
      strainNames.push(strainName)
    }
  })
  return strainNames
}


// this corrects by PAIRS of words, which lets us compare the whole strain name
// dictPairs = ['Escherichia coli']
// distRatio takes into account word length
export const straincorrectPairs = (text, strainNamePairsArr, maxDist = 6, maxDistRatio = 1, strainExcludeArr) => {
  // split text into pairs
  let textPairs = text.split(' ').map((word, i, arr) => {
    if (i < arr.length - 1) {
      return word + ' ' + arr[i + 1]
    }
  }).filter(el => (
    el !== undefined &&
    !(strainExcludeArr && strainExcludeArr.includes(el)) &&
    // each split word of el is longer than 4 — this also includes "spp." and "sp."
    el.split(' ').every(word => word.length > 4)
  ))

  // console.log('textPairs', textPairs)

  // compare each pair to the dict
  let correctedPairs = []
  textPairs.map(pair => {
    // regexp matching two words separated by space, strip all surrounding symbols like commas
    pair = pair.match(/(\w+)\s(\w+)/)?.[0]
    if (pair) {
      let minDist = maxDist
      let minDistStrain = pair
      for (let strainPairName of strainNamePairsArr) {
        let dist = leven(pair, strainPairName)

        // if we find the word in the dictionary, use it
        // if (dist == 0) {
        //   break
        // }

        if (dist == 0 || (dist < minDist && dist > 0 && dist < maxDist * maxDistRatio * pair.length)) {
          minDist = dist
          minDistStrain = strainPairName
          // console.log('[straincorrectPairs] Pair Match:', pair, minDistStrain, dist)
        }
      }
      // console.log('[straincorrectPairs] Pair:', pair, 'vs.', minDistStrain)
      correctedPairs.push({ pair, correction: minDistStrain })
    }

  })

  // console.log('[straincorrectPairs] Corrected Pairs', correctedPairs, text)

  // use the corrected pairs to replace the original text
  // console.log('Corrected Pairs:', correctedPairs, text)
  correctedPairs.forEach(pair => {
    // for each pair, replace pair.pair with regex strainPattern with pair.correction

    // text = text.replace(/[^a-zA-Z0-9.\s]/g, pair.correction)
    // text = text.replace(pair.pair.match(/[^a-zA-Z0-9.\s]/g), pair.correction)
    text = text.replace(pair.pair, pair.correction)
  })

  return text
}


// fixes contracted pairs like E. cale -> E. coli
export const straincorrectContractions = (text, strainNamesContrArr, maxDist = 10) => {
  // regex that matches a single letter, starting with a space or is the first letter, followed by an optional period
  let strainPattern = /(\s|^)(\w)\.?\s(\w+)/
  let textPairs = text.split(' ').map((word, i, arr) => {
    if (i < arr.length - 1) {
      return word + ' ' + arr[i + 1]
    }
  }).filter(el => el !== undefined && el.match(strainPattern))

  // console.log('Contracted textPairs', textPairs)

  // compare each pair to the dict
  let correctedPairs = []
  textPairs.map(pair => {
    // let correctedPair = pair
    let minDist = maxDist
    let minDistStrain = pair
    for (let dictStrainPair of strainNamesContrArr) {
      let dist = leven(pair, dictStrainPair)
      // first letter of dictStrainPair needs to match the first letter of pair
      // ignore cases where first letter is "I" because that's a common word
      if (dist == 0 || (dist < minDist && dist < maxDist && dictStrainPair[0].toLowerCase() == pair[0].toLowerCase() && pair[0] != 'I')) {
        minDist = dist
        minDistStrain = dictStrainPair
        // console.log('[contractionMatch]', pair, dictStrainPair, minDist)
      }
    }
    // console.log('Testing pair:', pair, minDistStrain)
    correctedPairs.push({ pair, correction: minDistStrain })
    return minDistStrain
  })

  // use the corrected pairs to replace the original text
  // console.log('Corrected Pairs:', correctedPairs, text)
  correctedPairs.forEach(pair => {
    // for each pair, replace pair.pair with regex strainPattern with pair.correction
    text = text.replace(pair.pair.match(strainPattern)[0], pair.correction)
  })

  return text
}


// this corrects individual words, but maybe we should compare word pairs against the whole strain name? — this also splits up the strain name into genus and species for better or worse; maybe we should treat them as one word
export const straincorrectWords = (text, strainNamesArr, maxDist = 3) => {
  let words = text.split(' ')
  let newWords = [], newWordObjs = []
  for (let word of words) {
    // use regex to only keep letters and numbers and period for word
    let newWord = word
    let strippedWord = word.replace(/[^a-zA-Z0-9.]/g, '')
    let minDist = maxDist
    for (let word2 of strainNamesArr) {
      if (strippedWord.length < 5)
        break // no genus names are this short

      let dist = leven(strippedWord, word2)
      // console.log('newWord', newWord, word2, levDist)

      // if we find the word in the dictionary, use it
      // if (levDist == 0) {
      //   break
      // }
      // comparing to minDist b/c we don't want to replace a word with a word that's further away 
      // if (dist == 0 || (strippedWord && word2 && dist < maxDist && dist > 0 && dist < minDist)) {
      if (dist == 0 || (dist < minDist && strippedWord && word2 && dist < maxDist)) {
        // use regex to replace word with strippedWord
        newWord = word.replace(strippedWord, word2).trim()
        // newWordObjs.push({ word, correction: newWord })
        minDist = dist
        // console.log('[straincorrectMatch]', word, word2, minDist, dist, maxDist)
      }
    }
    newWords.push(newWord)
  }
  text = newWords.join(' ').trim()
  // return { orig, text: text, corrections: newWordObjs }
  return text
}



/* 

  Helpers

*/

// takes full strain names e.g. Escherichia coli and contracts them to E. coli
export const contractStrainNames = (text, strainNamePairsArr, strainExcludeArr) => {

  // split text into pairs
  let textPairs = text.split(' ').map((word, i, arr) => {
    if (i < arr.length - 1)
      return word + ' ' + arr[i + 1]
  }).filter(el => (
    el !== undefined &&
    !(strainExcludeArr && strainExcludeArr.includes(el)) &&
    // each split word of el is longer than 4
    el.split(' ').every(word => word.length > 3)
  ))

  // console.log('[contractStrainNames] Contracted textPairs', textPairs)

  // compare each pair to the dict
  let correctedPairs = []
  textPairs.map(pair => {
    pair = pair.match(/(\w+)\s(\w+)/)?.[0]
    if (pair) {
      // if dictPairs contains each pair, add it to correctedPairs
      if (strainNamePairsArr.includes(pair)) {
        correctedPairs.push({ pair, correction: `${pair.replace(/(\w)\w+\s/g, '$1. ')}` })
      }
    }
  })

  // use the corrected pairs to replace the original text
  // console.log('Corrected Pairs:', correctedPairs, text)
  correctedPairs.forEach(pair => {
    // for each pair, replace pair.pair with regex strainPattern with pair.correction
    text = text.replace(pair.pair, pair.correction)
  })

  return text
}

// take correctly contracted strain names e.g. E. coli and expand them to Escherichia coli
export const expandStrainNames = (text, strainMap) => {
  // a version of strainPattern that does not include symbols at the end of the strain name
  let strainPattern = /(\s|^)(\w)\.?\s(\w+)/

  let textPairs = text.split(' ').map((word, i, arr) => {
    if (i < arr.length - 1) {
      return word + ' ' + arr[i + 1]
    }
  }).filter(el => el !== undefined && el.match(strainPattern))

  let correctedPairs = []
  textPairs.map(pair => {
    // regexp to remove surrounding symbols from pair
    pair = pair.match(strainPattern)?.[0]

    // if dictPairs contains each pair, add it to correctedPairs
    // console.log('Finding', pair, dictMap[pair])
    if (strainMap[pair]) {
      // console.log('Found', pair, dictMap[pair])
      correctedPairs.push({ pair, correction: strainMap[pair] })
    }
  })

  // use the corrected pairs to replace the original text
  // console.log('Corrected Pairs:', correctedPairs, text)
  correctedPairs.forEach(pair => {
    // for each pair, replace pair.pair with regex strainPattern with pair.correction
    text = text.replace(pair.pair, pair.correction)
  })

  // console.log('[expandStrainNames] Expanded text', text)
  return text
}

// wraps strain names in Markdown
// - "genus spp" needs to be wrapped separately
export const wrapMarkdown = (text, strainNamesArr) => {
  // text = text.replace(/(\s|^)(\w)\.?\s(\w+)/g, '$1*$2. $3*') // doesn't work with "I like"! Need to pass in contracted names
  // find instances in resultText from the strainDictPairs and wrap in italics
  strainNamesArr.forEach(strainName => {
    // regex that wraps "strainName", "strainName sp", "strainName sp." "strainName spp" and "strainName spp." in italics, and word must not start with "*" character
    // note: spp is NOT italiciized!
    // let pattern = new RegExp(`(\\s|^)(?!\\*)(${strainName}( spp\.| sp\.| spp| sp)?)`, 'g')
    let pattern = new RegExp(`(\\s|^)(?!\\*)(${strainName})`, 'g')
    text = text.replace(pattern, ' *' + '$2*')
  })
  return text
}

/* 
  takes an array of strain names and gets a mapped object that looks like
  {
    'K. pneumoniae': 'Klebsiella pneumoniae',
    'E. faecium': 'Enterococcus faecium',
    Enterococcus: 'Enterococcus',
    Staphylococcus: 'Staphylococcus'
  }
*/
export const turnStrainsToObj = (strainNames) => {
  return Object.fromEntries(strainNames.map(strain => [strain.replace(/(\w)\w+\s/g, '$1. '), strain]))
}








export const strainCorrection = ({
  input,
  dist,
  fixContractions = true, // "e. coli"
  mode, // "e. coli" -> "escherichia coli"
  strainText,
  // text that contains the strains for correct expansion, e.g. E. coli -> Escherichia coli vs. something-else coli
  // and for identifying strains
}) => {

  let resultText = ''
  let contractedStrainNames = getStrainNames('contracted')
  let pairedStrainNames = getStrainNames()
  let genusStrainNames = getStrainNames('genus')


  // 
  // 0. Process strainText if it exists, for expansion and strain identification 
  // correct strainText's pairs
  let strainTextStrainNames, strainTextStrainObj
  if (strainText) {
    strainText = straincorrectPairs(strainText, pairedStrainNames, 7, 0.7, contractedStrainNames)
    strainTextStrainNames = getStrainNamesFromText(strainText, [...pairedStrainNames, ...genusStrainNames, ...contractedStrainNames])

    // get a mapped version
    strainTextStrainObj = turnStrainsToObj(strainTextStrainNames)
  }



  if (input) {
    // throw error(500, 'Supply a text param, e.g. [utility/api/straincorrect/?text=words]!')

    // 
    // 1. fix all contractions; if we don't fix them, phrases like "I like" will be straincorrected to "I. limi"
    if (fixContractions) {
      resultText = straincorrectContractions(input, contractedStrainNames, dist)
    }
    console.log('Corrected Contractions:\n', resultText, '\n\n')


    // 
    // 2. correct paired strain words like "escherichia coli"
    resultText = straincorrectPairs(resultText, pairedStrainNames, 7, 0.7, contractedStrainNames)
    console.log('Corrected Paired strain words:\n', resultText, '\n\n')

    // 
    // 3. correct single words like "escherichia"
    resultText = straincorrectWords(resultText, genusStrainNames)
    console.log('Corrected Single strain / genus words:\n', resultText, '\n\n')

    // 
    // 4a. expand contractions
    if (mode == 'expand') {
      if (!strainText)
        throw error(500, 'Supply a strainText param, for strain name expansion!')

      // console.log('Matched Strain Dict:', strainTextStrainNames, strainTextStrainObj)
      resultText = expandStrainNames(resultText, strainTextStrainObj)
    }

    // 
    // 4b. contract expanded names like Escherichia coli > E. coli
    if (mode == 'contract') {
      resultText = contractStrainNames(resultText, pairedStrainNames, contractedStrainNames)
      console.log('Contracted Strain words: \n', resultText, '\n\n')
    }

  }

  // 5. wrap in markdown
  let markdown = wrapMarkdown(resultText, [...pairedStrainNames, ...contractedStrainNames, ...genusStrainNames])
  // let markdown = wrapMarkdown(resultText, [...pairedStrainNames, ...contractedStrainNames])

  let result = {}
  if (input) {
    result = {
      input,
      result: resultText,
      mode,
      markdown,
    }
  }
  if (strainText) result.strainText = { text: strainText, strains: strainTextStrainNames }

  if (!input && !strainText)
    throw error(500, 'Supply an input or a strainText param, e.g. [utility/api/straincorrect/?input=words] or [utility/api/straincorrect/?strainText=words]!')

  return result
}



