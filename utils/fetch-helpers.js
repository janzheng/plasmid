
/* upd: 6/17/2021

  Fetch Helpers


  fetchPost
    Util around fetch for post and send on sapper
    - stringifies and calls endpoint as json
    - takes a js object
    - needs to take fetch object since it's not guaranteed we have it

        const response = await fetch(
        `/api/passport/login`, {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(data)
        })
        = 
        const response = await fetchPost(url, data, fetch)



  fetchPostFiles
    Util wraps files object in a multipart form and submits it as a form (only way to submit files)
    - we don't actually declare Content-Type 'multipart/form-data' since fetch does that for us when it detects files!
    - currently only supports one file
    - use 'formidable' to handle the files

*/


export const fetchPost = async (url, data, fetch, headers) => {
  if (!fetch || !url || !data) // server-side won't have access to fetch object
    throw new Error('fetchPost needs access to the fetch object, data, and a url!')


  const response = await fetch(
    url, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
    body: JSON.stringify(data)
  })

  return response
}



// like fetchPost but uses GET w/ a obj body
// uses 'data' header w/ stringified json body
// don't pass too much data, as headers are usually tiny
export const fetchGet = async (url, data, fetch) => {
  if (!fetch || !url || !data) // server-side won't have access to fetch object
    throw new Error('fetchGet needs access to the fetch object, data, and a url!')


  const response = await fetch(
    url, {
    headers: {
      'data': JSON.stringify(data)
    },
    method: 'GET',
  })

  return response
}


// convenience function for fetching data and converting to json
export const fetchJson = async (url, fetch) => {
  if (!fetch || !url) // server-side won't have access to fetch object
    throw new Error('fetchJson needs access to the fetch object and a url!')

  const response = await fetch(url)
  const json = await response.json()

  return json
}


/*
  appends data into form, including files
  - use 'formidable' on the API to tease out files and fields 

  data: {
    recordId,
    someFile: files[0],
    name: someName,
  }

*/
// 
export const fetchPostForm = async (url, data, fetch) => {
  if (!fetch || !data || !url) // server-side won't have access to fetch object
    throw new Error('fetchPostForm needs access to the fetch object, data, and a url!')

  let formData = new FormData()
  Object.keys(data).map(key => {
    formData.append(key, data[key])
  })

  const response = await fetch(
    url, {
    // headers: { // fetch does this automatically!
    //   'Content-Type': 'multipart/form-data'
    // },
    method: 'POST',
    body: formData
  })

  return response
}



// not needed, just use fetchPostForm for images
// only supports one file for now
// export const fetchPostFile = async (url, files, fetch, data=undefined) => {
//   console.log('fethpostfile!!!!')
//   if (!fetch || !files || !url) // server-side won't have access to fetch object
//     throw new Error('fetchPostFile needs access to the fetch object, files, and a url!')

//   let file
//   // unless we process the file back into an image, we don't need reader
//   // const reader = new FileReader()

//   if(files && files[0]) {
//     // console.log("File: " , files[0])
//     // const reader = new FileReader()
//     // reader.onload = (e) => {
//     //   file = e.target.result
//     // }
//     // reader.readAsDataURL(files[0])

//     console.log('uploading:', file, files[0])

//     const response = await fetchPostForm(url, {
//       ... data,
//       avatar: files[0]
//     }, fetch)

//     return response
//   }
// }


