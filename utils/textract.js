
import textract from "textract";

export const extractLink = async (link) => {
  return new Promise((resolve, reject) => {
    textract.fromUrl(link, function (error, text) {
      return resolve(text)
    })
  })
}

