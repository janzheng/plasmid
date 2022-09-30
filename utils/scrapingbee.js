

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
    result = ""
    let beeresults = ``
    let __fetch = _fetch || fetch // for server-side or client-side

    const str = `https://app.scrapingbee.com/api/v1?api_key=${api_key}&url=${encodeURIComponent(url)}&render_js=${render_js}&block_resources=${block_resources}&timeout=${timeout}&extract_rules=${extract_rules}`
    console.log('[scrapingbee] fetching', str)
    const response = await __fetch(str)
    

    // success
    if (response.status == 200) {
      beeresults = await response.text()
      console.log('bee init results:', beeresults)
      result = beeresults
      console.log('bee text:', result)
      return result
    }

    console.log(response)
  } catch (err) {
    console.error('scrapingbee error:', err)
    isScraping = false
  }
}