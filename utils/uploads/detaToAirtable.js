
import { addRecord } from "../airfetch"


/* 

  This takes an existing file from Deta, shared by the local Deta API endpoint, and moves it to an Airtable record

*/
export const detaToAirtableFilePoster = async ({ request, url }) => {
  const details = await request.json(); // or .json(), or .text(), etc
  const detaApiFilePath = details.path || '/deta/uploads/' // file path that loads the file from Deta
  const tableName = details.tableName
  const fieldName = details.fieldName || 'Attachments'


  const record = await addRecord(
    tableName,
    // localhost:1234/deta/airtable/filename
    { [fieldName]: [{ url: `${url.origin}${detaApiFilePath}${details.filename}` }], },
    null,
    { insertOptions: ['typecast'], },
  )

  return {
    body: record,
  };
};