

// chunked upload to Deta
// needs to expose apiKey to client
// bypasses micros / lamba file size limitations
// https://stackoverflow.com/questions/33537769/how-to-upload-a-file-with-ajax-in-small-chunks-and-check-for-fails-re-upload-th
export const detaUpload = async (file, projId, baseName, apiKey, progress) => {
  console.log('initializing upload', file.name)
  // init chunked upload
  let initUploadJson
  let loaded = 0

  if (progress)
    progress.set({
      loaded: 0,
      percent: 0,
      status: 'Connecting to server'
    })

  const initUpload = await fetch(
    `https://drive.deta.sh/v1/${projId}/${baseName}/uploads?name=${file.name}`, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey
    }
  })

  return new Promise(async (res, rej) => {

    if (initUpload.ok) {
      initUploadJson = await initUpload.json()
      console.log(initUploadJson)
      // {
      //     "name": "file name",
      //     "upload_id": "a unique upload id"
      //     "project_id": "deta project id",
      //     "drive_name": "deta drive name"
      // }

      let step = 1024 * 1024 * 7 // size of one chunk
      let total = file.size;  // total size of file
      let start = 0;          // starting position
      let reader = new FileReader();
      let blob = file.slice(start, step); //a single chunk in starting of step size
      let part = 1
      reader.readAsBinaryString(blob);   // reading that chunk. when it read it, onload will be invoked



      if (progress)
        progress.set({
          loaded: 0,
          percent: 0,
          status: 'Starting upload'
        })

      reader.onload = async function (e) {

        let d = { file: reader.result }

        const detaUpload = await fetch(
          `https://drive.deta.sh/v1/${projId}/${baseName}/uploads/${initUploadJson.upload_id}/parts?name=${file.name}&part=${part}`, {
          headers: {
            'X-Api-Key': apiKey
          },
          method: 'POST',
          body: blob
        })

        if (detaUpload.ok) {
          let detaUploadJson = await detaUpload.json()
          console.log(' ---- chunk:', detaUploadJson)
          // $('.record_reply_g').html(r);   //updating status in html view

          loaded += step;                 //increasing loaded which is being used as start position for next chunk

          if (progress)
            progress.set({
              loaded,
              pecent: parseInt((loaded / total) * 100),
              status: 'Uploading'
            })

          part++
          console.log(' --------- upload progress: ', file.name, file.type, (loaded / total) * 100, 'step', step, 'loaded', loaded, 'total', total)

          if (loaded + step > total) {      // last chunk
            console.log(' closing :::: ')

            if (progress)
              progress.set({
                loaded,
                percent: 100,
                status: 'Finishing upload'
              })

            const closeRes = await fetch(
              `https://drive.deta.sh/v1/${projId}/${baseName}/uploads/${initUploadJson.upload_id}?name=${file.name}`, {
              headers: {
                'X-Api-Key': apiKey
              },
              method: 'PATCH',
              body: blob
            })

            if (closeRes.ok) {
              let closeResJson = await closeRes.json()
              console.log('uploaded & closed ::', closeResJson)

              if (progress)
                progress.set({
                  loaded,
                  percent: 100,
                  status: 'Finishing upload',
                  completed: true,
                  result: closeResJson
                })

              res(closeResJson)
            } else
              rej(closeRes)
          } else if (loaded <= total) {            // if file is not completely uploaded
            blob = file.slice(loaded, loaded + step);  // getting next chunk
            reader.readAsBinaryString(blob);        //reading it through file reader which will call onload again. So it will happen recursively until file is completely uploaded.
          } else {                       // if file is uploaded completely
            loaded = total;            // just changed loaded which could be used to show status.

            if (progress)
              progress.set(loaded)
          }
        }
      }

    }
  })
}





