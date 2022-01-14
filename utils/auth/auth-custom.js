
/*

	Helpers specifically for each site or domain

*/



import { saveSetup, save } from '../save.js'


export const addProfileForNewUser = async (_user, userData) => {

  const record = await save({
    tableName: 'Profiles',
    payload: {
    	Accounts: [_user.id],
    	// Name: _user['fullName'] || "",
      userName: userData['userName'] || '',
      ProfileImage: userData['ProfileImage'] || '',
    },
    insertOptions: ['typecast'],
    baseKey: {
    	apiWriteKey: process.env.AIRTABLE_ACCOUNTS_WRITE_API,
    	baseId: process.env.AIRTABLE_ACCOUNTS_BASE,
    }
  })

  return record
}