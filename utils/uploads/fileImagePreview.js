

/*

  "reader" is either from browser or node FileReader
  - needs to be passed in so this fn can be more flexible

  ex: let reader = new FileReader();

*/
export const getFileImagePreview = async ({file, reader = new FileReader()}) => {
  return new Promise( (res, rej) => {
    reader.addEventListener("load", function () {
      res(reader.result)
    }, false);
    reader.readAsDataURL(file)
  })
} 