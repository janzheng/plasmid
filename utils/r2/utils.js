

// import { getFileHash } from '$plasmid/utils/uploads/fileHash';
// import { uploadFileToR2, requestPresignedUrl, uploadPresignedUrl } from '$plasmid/utils/r2/r2';











// for Sveltekit to handle drag and drop in a component for FOLDERS and MULTIPLE FILES
// handles single file + multiple file + folders, which regular inputs CAN'T do
// [gpt-4 generated]
export async function handleDrop(e) {
  e.preventDefault();
  // const items = [...e.dataTransfer.items]; // does weird things; only keeps first file entry?
  // let dropFiles = [...e.dataTransfer.items].filter(item => item.kind === 'file').map(item => item.getAsFile());
  let entries = [...e.dataTransfer.items].filter(item => item.kind === 'file').map(item => item.webkitGetAsEntry());
  // Process the files here, such as uploading or reading their content
  console.log('[onDrop]', entries)

  let fileObjects = [];
  for (const entry of entries) {
    if (entry) {
      // console.log('----> item:entry', entry)
      if (entry.isFile) {
        const fileObject = await getFile(entry);
        fileObjects.push(fileObject);
      } else if (entry.isDirectory) {
        const dirFiles = await readDirectory(entry, entry.name);
        fileObjects.push(...dirFiles);
      }
    }
  }

  // this also prevents you from uploading many of the same files from the same path
  fileObjects = fileObjects.filter((v, i, a) => a.findIndex(t => t.path === v.path) === i)

  // filter out fileObjects where path includes ".DS_Store" (Mac thing)
  fileObjects = fileObjects.filter(fileObject => !fileObject.path.includes(".DS_Store"));

  // console.log('[onDrop] fileObjects', fileObjects);
  return fileObjects
}

export function readDirectory(directory, path) {
  return new Promise((resolve) => {
    const fileObjects = [];
    const dirReader = directory.createReader();

    const readEntries = () => {
      dirReader.readEntries(async (entries) => {
        if (entries.length) {
          for (const entry of entries) {
            const fullPath = `${path}/${entry.name}`;
            if (entry.isFile) {
              const fileObject = await getFile(entry);
              fileObject.folderPath = path;
              fileObject.path = fullPath;
              fileObjects.push(fileObject);
            } else if (entry.isDirectory) {
              const dirFiles = await readDirectory(entry, fullPath);
              fileObjects.push(...dirFiles);
            }
          }
          readEntries(); // Read more entries if there are any
        } else {
          resolve(fileObjects);
        }
      });
    };

    readEntries();
  });
}

export function getFile(fileEntry) {
  return new Promise((resolve) => {
    fileEntry.file((file) => {
      resolve({ file, path: fileEntry.fullPath });
    });
  });
}

