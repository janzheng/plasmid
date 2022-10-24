

import csv from 'csvtojson'


// sheet must be shared publicly; the tab must be specified as a "gid" in the url
// link looks like: https://docs.google.com/spreadsheets/d/e/2PACX-1vSpQZU8OZU0aNJEC5z3c9M7sgtFYBiY5M20YIOpBewWrA0ZSZkhPIrboxS0EXtSSWP3_PkvCzl_fRJy/pub?output=csv 
// https://docs.google.com/spreadsheets/d/e/2PACX-1vSpQZU8OZU0aNJEC5z3c9M7sgtFYBiY5M20YIOpBewWrA0ZSZkhPIrboxS0EXtSSWP3_PkvCzl_fRJy/pub?gid=281070310&&output=csv
export const getSheetFromLink = async (csv_url) => {
  const response = await fetch(csv_url + "&output=csv");
  const csv_text = await response.text();
  return await csv().fromString(csv_text)
}