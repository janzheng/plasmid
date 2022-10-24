

import csv from 'csvtojson'

// public clinical trials: https://docs.google.com/spreadsheets/d/e/2PACX-1vQgAVErImZAUjqKgBhhZTgDd7ysalOKG_YgFO-jx5_RhvsYiqd7zpugctBH5SkIDJJJxWZjzIKbgOhg/pub?output=csv
export const trialsLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgAVErImZAUjqKgBhhZTgDd7ysalOKG_YgFO-jx5_RhvsYiqd7zpugctBH5SkIDJJJxWZjzIKbgOhg/pub?output=csv"

// public glossary: https://docs.google.com/spreadsheets/d/1t9VS-3PGyeTSc-Oco9Ec1BkeY8ve0i-nHVbVgD2bdcE/edit#gid=0
export const glossaryLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnoexVYk06_wJ3wPsSUKn5MLbSVJ2N-hwj6g_NGWgzeQ8NG0pRx5pLGX5fineWiDOcduqQfFD82j5d/pub?output=csv"

// sheet must be shared publicly; the tab must be specified as a "gid" in the url
// link looks like: https://docs.google.com/spreadsheets/d/e/2PACX-1vSpQZU8OZU0aNJEC5z3c9M7sgtFYBiY5M20YIOpBewWrA0ZSZkhPIrboxS0EXtSSWP3_PkvCzl_fRJy/pub?output=csv 
// https://docs.google.com/spreadsheets/d/e/2PACX-1vSpQZU8OZU0aNJEC5z3c9M7sgtFYBiY5M20YIOpBewWrA0ZSZkhPIrboxS0EXtSSWP3_PkvCzl_fRJy/pub?gid=281070310&&output=csv
export const getSheetFromLink = async (csv_url) => {
  const response = await fetch(csv_url + "&output=csv");
  const csv_text = await response.text();
  return await csv().fromString(csv_text)
}

export const getTrials = async () => {
  return getSheetFromLink(trialsLink)
}
export const getGlossary = async () => {
  return getSheetFromLink(glossaryLink)
}