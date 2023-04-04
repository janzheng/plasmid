
import { PUBLIC_SCRAPING_BEE } from '$env/static/public';


export const getBee = async ({
  api_key,
  url,
  render_js = false,
  timeout = 10000,
  block_resources = true,
  extract_rules = `{"text":"body"}`,
}, _fetch) => {

  let result
  try {
    result = null
    let beeresults = ``
    let __fetch = _fetch || fetch // for server-side or client-side

    if(!url || url=='undefined') {
      console.error('[getBee] need a URL!')
      return null
    }

    const str = `https://app.scrapingbee.com/api/v1?api_key=${api_key}&url=${encodeURIComponent(url)}&render_js=${render_js}&block_resources=${block_resources}&timeout=${timeout}&extract_rules=${extract_rules}`
    console.log('[scrapingbee] fetching', str)
    const response = await __fetch(str)
    
    // success
    if (response.status == 200) {
      beeresults = await response.text()
      console.log('[getBee] results:', beeresults)
      result = beeresults
      return result
    } else {
      console.error('[getBee] response:', response.status)
      return null
    }

  } catch (err) {
    console.error('[getBee] error:', err)
    isScraping = false
  }
}



export const getBeeArticle = async (link, charlim = 60000) => {
  let text = null
  let json = await getBee({
    api_key: PUBLIC_SCRAPING_BEE,
    url: link,
    extract_rules: `{"main":"main", "article":"article","text":"body"}`
  })
  console.log('Scrapingbee response:', json)
  if (json) {
    json = JSON.parse(json)
    text = json.main || json.article || json.text
    text = text.substring(0, 8000)
  }
  return text

}
