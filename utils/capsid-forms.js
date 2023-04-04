
import { env } from '$env/dynamic/private';

import { socialParse } from "$plasmid/utils/social-parser"
import { addRecord_v2, flattenRecord } from '$plasmid/utils/airfetch'
import { encryptData, decryptData } from '$plasmid/utils/webcrypto'



// complex transformation
export const tr_v3playground = (data) => {
  data.baseId = env['AIRTABLE_BASE_V3_INTERNAL']
  data.table = 'Playground'
  // 
  data.tableOptions = { "insertOptions": ["typecast"] }

  // example of adding encryption w/ a defined password
  data.encrypt = {
    "field": "Encrypted",
    "password": "banana"
  },

    // fields to carry over
    data.fields = {
      ...data.fields,
      'Comments': data.fields['Name'] + '!!!'
      // 'Name': data.fields['Name'] || data.fields['First Name'] + ' ' + data.fields['Last Name'],
    }
  return data
}






/* 
  if supplied data.type, process it by adding base ID and running additional stuff.
*/
export const processRouteType = async (data) => {
  if (!data.type)
    return data

  let social, socialMap

  switch (data.type) {
    //
    // PDv3 Internal
    //
    case 'v3-playground':
      data = tr_v3playground(data)
      break;

    //
    // PDv3 Public DB
    //
    case 'hosts':
      data.baseId = env['V3_DB_BASE']
      data.table = 'Hosts'
      data.fields = {
        'Name': data.fields['Name'],
        'Status': 'Published',
      }
      break;
    case 'profile':
      social = socialParse(data.fields['Social'])
      socialMap = social?.resultsMap
      delete data.fields['Social']

      data.baseId = env['V3_DB_BASE']
      data.table = 'People'
      data.tableOptions = { "insertOptions": ["typecast"] }

      data.fields = {
        // passed in schema needs to match Airtable schema
        ...data.fields,
        'Social:Twitter': socialMap?.get('twitter@')?.url || socialMap?.get('twitter')?.url,
        'Social:Linkedin': socialMap?.get('linkedin')?.url,
        'Social:Github': socialMap?.get('github')?.url,
        'Social:ORCID': socialMap?.get('orcid')?.url,
        'Social:URL': socialMap?.get('website')?.url,
        'Social:ResearchGate': socialMap?.get('researchgate')?.url,
        'Social:GoogleScholar': socialMap?.get('googlescholar')?.url,

        'Status': 'Published',
        'Status:Internal': 'Automation:FormsAPI',
      }
      break;
    case 'org': // also covers labs
      social = socialParse(data.fields['Social'])
      socialMap = social?.resultsMap
      delete data.fields['Social']

      data.baseId = env['V3_DB_BASE']
      data.table = 'Organizations'
      data.tableOptions = { "insertOptions": ["typecast"] }

      data.fields = {
        // passed in schema needs to match Airtable schema
        ...data.fields,
        'Social:Twitter': socialMap?.get('twitter@')?.url || socialMap?.get('twitter')?.url,
        'Social:Linkedin': socialMap?.get('linkedin')?.url,

        'Status': 'Published',
        'Status:Internal': 'Automation:FormsAPI',
      }
      break;
    case 'collection':
      data.baseId = env['V3_DB_BASE']
      data.table = 'PhageCollections'
      data.tableOptions = { "insertOptions": ["typecast"] }

      data.fields = {
        ...data.fields,
        'Status': 'Published',
        'Status:Internal': 'Automation:FormsAPI',
      }
      break;



    //  
    // PDv3 Website / (Atoms)
    // 
    case 'jobs':
      data.baseId = env['V3_PUBLIC_BASE']
      data.table = 'Atoms'
      data.tableOptions = { "insertOptions": ["typecast"] }
      data.fields = {
        'Name': data.fields['Name'],
        'Data:Date': data.fields['Date'],
        'Data:Tags': data.fields['Tags'],
        'Markdown': data.fields['Description'],
        'URL': data.fields['URL'],
        'Status': 'Published',
        'Atom:Type': 'Job',
      }
      break;
    case 'community':
      data.baseId = env['V3_PUBLIC_BASE']
      data.table = 'Atoms'
      data.tableOptions = { "insertOptions": ["typecast"] }
      data.fields = {
        'Name': data.fields['Name'],
        'Data:Date': data.fields['Date'],
        'Data:Tags': data.fields['Tags'],
        'Markdown': data.fields['Description'],
        'Status': 'Published',
        'Atom:Type': 'Community',
      }
      break;
    case 'updates':
      data.baseId = env['V3_PUBLIC_BASE']
      data.table = 'Atoms'
      data.tableOptions = { "insertOptions": ["typecast"] }
      data.fields = {
        'Name': data.fields['Name'],
        'Data:Tags': data.fields['Tags'],
        'Markdown': data.fields['Description'],
        'URL': data.fields['URL'],
        'Status': 'Published',
        'Atom:Type': 'Update',
      }
      break;

  }

  console.log('processRouteType Result -->', data)
  return data
}







export const formRouter = async (data) => {

  // console.log('data:', await encryptData(data, "bananarama"))
  data = await processRouteType(data)

  if (data.encrypt) {
    const { field, password, message } = data.encrypt
    let encryptedData = await encryptData(JSON.stringify(message || data.fields), password)
    data.fields[field] = encryptedData
  }
  if (data.sendToCapsid) {
    // Sends a new job/update/link/community to "Collecting C&T Links"
    await sendToCapsid({
      type: data.sendToCapsid,
      name: data.fields['Name'],
      summary: data.fields['Summary'] || data.fields['Description'] || data.fields['Markdown'],
      keywords: data.fields['Keywords'] || data.fields['Tags'] || data.fields['Data:Tags'],
      url: data.fields['URL']
    })
  }

  // let decrypted = JSON.parse(await decryptData("+RdH8+gT4y2OObGWB9b0ymqv/Cmlc/B/p2zOo6V4PVN4CfTkqY+5r6uIBfbsW8mhXzANfiwCnKBbPkapudBfPM+nkfjUrK4FBVM=", "banana"))
  // console.log('decrypted!!:', decrypted)

  try {
    let res = await addRecord_v2({
      recordId: data.recordId,
      tableName: data.table,
      payload: data.fields,
      _baseId: env[data?.baseEnvId] || data?.baseId || env.AIRTABLE_PRIVATE_BASE,
      tableOptions: data.tableOptions // || { insertOptions: ["typecast"] },
    })

    console.log('Form Router:', flattenRecord(res))
    return { success: true, data: flattenRecord(res) }
  } catch (err) {
    return { error: err?.message || err }
  }
}





// intercept POST requests and process them
export const postData = async ({ request }) => {
  try {
    const data = await request.json();
    console.log('postData', data)
    return json(await formRouter(data));
  } catch (e) {
    console.error('[form/api/+server.js] Post failed:', e?.message)
    throw errorjson(500, e?.message)
  }
}



















/* 

  Sends a new job/update/link/community to "Collecting C&T Links"
  https://www.notion.so/phagedirectory/f2ca2eb92d184200b0d371f822af1856?v=3e7cd1164fb04fc4b8a1f4f9ee761dd8


*/

import notionClient from "@notionhq/client";
import { createPage } from '$plasmid/utils/notion'
export const sendToCapsid = async ({ name, summary, keywords, type, url }) => {
  const notion = new notionClient.Client({
    auth: process.env.NOTION_API,
  });

  try {

    const properties = {}
    if (name) {
      properties['Title (internal)'] = {
        title: [
          {
            text: {
              content: name
            }
          }
        ]
      }
    }
    if (summary) {
      properties['Blurb'] = {
        rich_text: [
          {
            text: {
              content: summary
            }
          }
        ]
      }
    }
    if (type) {
      properties['Type'] = {
        select: {
          name: type
        }
      }
    }
    if (keywords) {
      properties['Tags'] = {
        multi_select: keywords.split(',').map(tag => {
          return {
            name: tag
          }
        })
      }
    }
    if (url) {
      properties['URL'] = {
        url: url
      }
    }
    const parent = { // "Collecting C&T Links"
      "type": "database_id",
      "database_id": "f2ca2eb92d184200b0d371f822af1856"
    }
    const response = await createPage(parent, properties, notion)
    console.log('sendToCapsid', properties, response)
    return response

  } catch (err) {
    console.error(err)
  }
}