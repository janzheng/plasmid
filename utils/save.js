/*

    save.js

    - generic way to save to an Airtable base
    - chained to easily notify
    
    Usage:

		  saveSetup({
	  		apiWriteKey: process.env.PDV4_CREATOR_API,
	  		baseId: process.env.SUBMISSIONS_AIRTABLE_BASE
	  	})

	  	const record = save({
	  		tableName: 'General',
	  		recordId: '12345',
	  		payload: {
	  			Name: "Jan 🍌",
	  			Email: "jan@phage.directory"
	  		}
	  	})


    last updated: 8/17/2020

*/



import Cytosis from 'cytosis';

// use setup to prep this — this is necessary b/c keys and baseIDs are so dynamic between projects
let apiWriteKey // process.env.AIRTABLE_PRIVATE_API
let baseId // process.env.AIRTABLE_PRIVATE_BASE

export const saveSetup = async (data) => {
	apiWriteKey = data['apiWriteKey']
	baseId = data['baseId']
	console.log(':: Save Setup Complete ::')
}

// to 'replace', use insertOptions=['typecast', 'replace']
export const save = async ({payload, tableName, recordId, insertOptions=['typecast'], baseKey}) => {

	console.log('[Save] Saving payload: ', recordId, payload )

	// if the payload has a 'recordId' field we remove it automatically since it's auto-gen and will
	// be rejected by the API
	delete payload.recordId
	delete payload.lastModified

	// 	baseKey && baseKey.apiWriteKey ? baseKey.apiWriteKey : apiWriteKey, 
	// 	baseKey && baseKey.baseId ? baseKey.baseId : baseId, 
	// 	tableName, recordId)
	
	const cytosis = await Cytosis.save({
	  apiKey: baseKey && baseKey.apiWriteKey ? baseKey.apiWriteKey : apiWriteKey,
	  baseId: baseKey && baseKey.baseId ? baseKey.baseId : baseId,
	  tableName: tableName,
	  tableOptions: {
	    insertOptions: insertOptions,
	  },
	  recordId: recordId,
	  payload: payload
	})

	return cytosis
}

