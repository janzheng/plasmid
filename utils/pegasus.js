 
// not really used; use GPT3 instead

export const getPegasusSummary = async (text, limit = 20000) => {
  await s.acquire()
  try {
    if (!text || text.length < 5)
      return ''

    // text = "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."
    text = text.substring(0, limit)

    console.log('Initiating pegasus:', text.length, text)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/tuner007/pegasus_summarizer",
      {
        headers: { Authorization: `Bearer ${env.HUGGINGFACE_API}` },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );
    const result = await response.json();
    console.log('----pegasus', text.length, result, text)
    return result?.[0]?.summary_text;
  } finally {
    s.release();
  }
  // catch (err) {
  //   console.error(err.message || err)
  // }
}
