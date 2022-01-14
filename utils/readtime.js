

/*
  Read time is based on the average reading speed of an 
  adult (roughly 265 WPM). We take the total word count 
  of a post and translate it into minutes, with an 
  adjustment made for images. 
*/

export const readtime = (words) => {
  if(words && words.length>0) {
    const arr = words.split(' ')
    return Math.round(arr.length / 150) // use 250 instead of 265 b/c of technical content
  }
}
