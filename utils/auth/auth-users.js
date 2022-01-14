

/*

	Auth User Management

	— swap the user out for Fauna, Cytosis, or other back-end

  to get passport auth working you need:

  yarn add @polka/redirect passport passport-local passport-twitter bcryptjs crypto nodemailer

  - add the server.js middleware for passport
  - twitter added by example; add whatever social strategies (or comment the ones you don't need out)
  - don't forget the OAuth keys setup for your various social apps, callback, etc. done
  - get your ENV keys setup properly
    - OAuth Keys
    - Airtable API + Base keys
  - get addUsers and other DB-altering fns to point to the right place
  - if you're using an Airtable base for accounts, be sure of the defaults:
    - Table is called "Accounts"
    - The Index field is called "id"
    - Required fields: 
      - _phid, fullName, email, password, tokenId, token, tokenExpires, resetToken, resetExpires, activestatus, 
      - 'recordId': needs to be a formula that calculates RECORD_ID() (this is used b/c only fields are extracted from airtable objects, and we need recordid to replace existing items)
      - 'profiles': for storing oauth profile data 
    - Optional fields: Status, avatar,


  *** Branched – only Twitter is active
  
  Last updated: 10/4/2020

*/

import passport from 'passport'
import LocalStrategy from 'passport-local'
// import GoogleStrategy from 'passport-google-oauth20'
import TwitterStrategy from 'passport-twitter'
// import GithubStrategy from 'passport-github2'
// import FacebookStrategy from 'passport-facebook'
// import OrcidStrategy from 'passport-orcid'
// import LinkedInStrategy from 'passport-linkedin-oauth2'
// import ProtocolsioStrategy from './protocolsio-strategy'

import { getToken, getShortToken, hashPassword, comparePasswords, sanitizeUserForClient } from './auth-helpers.js'


import Cytosis from 'cytosis';
import { config } from "dotenv";
import { cacheGet, cacheSet, cacheClear } from "../cache"
import { saveSetup, save } from '../../_utils/save.js'
import { addProfileForNewUser } from './auth-custom'


// for external services like server.js
export const getPassport = () => {
	return passport
}




// for testing only
export const users = [];

const apiWriteKey = process.env.AIRTABLE_ACCOUNTS_WRITE_API
const baseId = process.env.AIRTABLE_ACCOUNTS_BASE
const userTableName = 'Accounts'


saveSetup({ // for easy airtable saving
	apiWriteKey: apiWriteKey,
	baseId: baseId,
})
	

// NOT implementing a nuke option.
// export const clearUsers = async (catalogue, queries) => {

//   const cytosis = await new Cytosis({
//     apiKey: apiWriteKey,
//     baseId: baseId,
//     bases:  [
//       {
//         tables: ['Phages'],
//       },
//     ],
//     routeDetails: '[api/generate/clearCatalogue]',
//   })

//   let p_await = cytosis.results['Phages'].map(async (record) => {
//     // console.log('>> ', record.id)
//     return await Cytosis.delete({
//       apiKey: apiWriteKey,
//       baseId: baseId,
//       tableName: 'Phages',
//       recordId: record.id,
//     })
//   })

//   return Promise.all(p_await).then(results => {
//     return results
//   })
  
// }




// for testing only — creates circular dep
export const initUsers = async () => {
	// const pass = await hashPassword('testtest')
	// const pass2 = await hashPassword('woofwoof')
	// users.push({
	//   id: 'local/a0234aDdfj-2f4sdfa3oEerq-2U4',
	//   fullName: 'User X',
	//   email: 'janeazy@gmail.com',
	//   password: pass,
	// },  {
 //    id: 'local/a0234aDdfj-2f4sdfa3oEerq-ABC',
 //    fullName: 'Boy Good',
 //    email: 'hello@janzheng.com',
 //    password: pass2,
 //    token: '$2a$10$t1fuE9N6O2Vt9Q7XRgQv0.QfVWqHzVrwZRGx/bJaWE90Y7yYZcQo.',
 //    tokenExpires: 1596479017110,
 //    // 8dfe8163e123ac85bd25
 //  },
	//  {
	//   id: 'google/114420147382433900437',
	//   email: undefined,
	//   fullName: 'Jan Zheng',
	//   // profile: {
	//   //   id: '114420147382433900437',
	//   //   displayName: 'Jan Zheng',
	//   //   name: [Object],
	//   //   photos: [Array],
	//   //   provider: 'google',
	//   //   _raw: '{\n' +
	//   //     '  "sub": "114420147382433900437",\n' +
	//   //     '  "name": "Jan Zheng",\n' +
	//   //     '  "given_name": "Jan",\n' +
	//   //     '  "family_name": "Zheng",\n' +
	//   //     '  "picture": "https://lh3.googleusercontent.com/a-/AOh14GjYRg-In1Q0a7eNQwhYGBiUB4Oh-RpXLQd8TOE36g",\n' +
	//   //     '  "locale": "en"\n' +
	//   //     '}',
	//   //   _json: [Object]
	//   // },
	//   // tokens: {
	//   //   accessToken: 'ya29.a0AfH6SMBq5Yz-Tj3llzAnUjSHIEpldZIow7z4KDZd_-3SxkE_9F1PSnPfsZzvnPB1M4Z1GPILPM1mYs3g1jZvXis7mLbYBdMmJhJw6rCqJkDCUGkhoyUxlP6KgWjVHUEIdbGp6XRGHHmS23YGlIHiFhXMabm1xTpppD4',
	//   //   refreshToken: undefined
	//   // }
	// }
 //  )
}








// user cache needs to be cleared whenever a save happens on it
// const clearUserTokenCache = (token) => {
//   const _cachestr = `findUserByToken/${userToken}`
//   cacheClear(_cachestr)
// }
const clearUserIdCache = (_userId) => {
  const _cachestr = `userId/${_userId}`
  cacheClear(_cachestr)
}



export const findUserById = async (_userId) => {
  if(!_userId)
    throw new Error('[findUserById] Provide a valid _userId')

	const _cachestr = `userId/${_userId}`
  let cacheObj = cacheGet(_cachestr, false)
  if (cacheObj)
    return cacheObj


  const cytosis = await new Cytosis({
    apiKey: apiWriteKey,
    baseId: baseId,
    bases:  [
      {
        tables: ['Accounts'],
        options: {
          "maxRecords": 1,
          keyword: `${_userId}`,
          matchKeywordWithField: 'id',
          matchStyle: 'exact',
        }
      },
    ],
    routeDetails: '[api/auth/findUsersById]',
  })
  if(cytosis.results['Accounts'][0]) {
    cacheSet( _cachestr, cytosis.results['Accounts'][0]['fields'] )
  	return cytosis.results['Accounts'][0]['fields']
  }
  return undefined
}

export const findUserByOauth = async (_oauthId) => {
  if(!_oauthId)
    throw new Error('[findUserByOauth] Provide a valid _oauthId')

  const _cachestr = `_oauthId/${_oauthId}`
  let cacheObj = cacheGet(_cachestr, false)
  if (cacheObj)
    return cacheObj

  const cytosis = await new Cytosis({
    apiKey: apiWriteKey,
    baseId: baseId,
    bases:  [
      {
        tables: ['Accounts'],
        options: {
          "maxRecords": 1,
          keyword: `${_oauthId}`,
          matchKeywordWithFields: ['id','profiles'],
          matchStyle: 'partial',
        }
      },
    ],
    routeDetails: '[api/auth/findUserByOauth]',
  })
  if(cytosis.results['Accounts'][0]) {
    cacheSet( _cachestr, cytosis.results['Accounts'][0]['fields'] )
    return cytosis.results['Accounts'][0]['fields']
  }
  return undefined
}






export const findUserByEmail = async (email) => {
  if(!email)
    throw new Error('[findUserByEmail] Provide a valid email')

  // not used often enough for caching; could collide 
	// const _cachestr = `userEmail/${email}`
  // if (cacheGet(_cachestr))
    // return cacheGet(_cachestr)

  const cytosis = await new Cytosis({
    apiKey: apiWriteKey,
    baseId: baseId,
    bases:  [
      {
        tables: ['Accounts'],
        options: {
          "maxRecords": 1,
          keyword: `${email}`,
          matchKeywordWithField: 'email',
          matchStyle: 'exact',
        }
      },
    ],
    routeDetails: '[api/auth/findUsersByEmail]',
  })

  if(cytosis.results['Accounts'][0]) {
    // cacheSet( _cachestr, cytosis.results['Accounts'][0]['fields'], 60*60 )
  	return cytosis.results['Accounts'][0]['fields']
  }
  return undefined
}



// flexible user field finder, works for email, username, phid, etc.
export const findUserByField = async (keyword, fieldname, opts) => {
  if(!fieldname)
    throw new Error('[findUserByFieldname] Provide a fieldname')

  const cytosis = await new Cytosis({
    apiKey: apiWriteKey,
    baseId: baseId,
    bases:  [
      {
        tables: ['Accounts'],
        options: {
          "maxRecords": 1,
          keyword: `${keyword}`,
          matchKeywordWithField: fieldname,
          matchStyle: opts.matchStyle || 'exact',
        }
      },
    ],
    routeDetails: '[api/auth/findUserByField]',
  })

  if(cytosis.results['Accounts'][0]) {
    // cacheSet( _cachestr, cytosis.results['Accounts'][0]['fields'], 60*60 )
    return cytosis.results['Accounts'][0]['fields']
  }
  
  return undefined
}



// user tokens come in the form of {tokenId}--{token}
// the tokenId is used to find the record
// the token itself needs to be compared to the hashed token
// - this is NOT cacheable
export const findUserByToken = async (userToken, opts) => {
  if(!userToken)
    throw new Error('[findUserByToken] Provide a valid token')

  let _activateUser
  let _deleteTokens

  if(opts) {
    _activateUser = opts['activateUser']
    _deleteTokens = opts['deleteTokens']
  }

	let user
	// const _cachestr = `findUserByToken/${userToken}`

  // don't use cache for this fn
  // if (cacheGet(_cachestr))
  //   return cacheGet(_cachestr)

  const tokenStrs = userToken.split('--') // user tokens come in the form of {tokenId}--{token}
  const tokenId = tokenStrs[0]
  const token = tokenStrs[1]

  const cytosis = await new Cytosis({
    apiKey: apiWriteKey,
    baseId: baseId,
    bases:  [
      {
        tables: ['Accounts'],
        options: {
          "maxRecords": 1,
          keyword: `${tokenId}`,
          matchKeywordWithField: 'token',
          matchStyle: 'partial',
        }
      },
    ],
    routeDetails: '[api/auth/findUserByToken]',
  })


  if(cytosis && cytosis.results['Accounts'] && cytosis.results['Accounts'].length > 0 && cytosis.results['Accounts'][0]) {
    // cacheSet( _cachestr, cytosis.results['Accounts'][0]['fields'], 60*60 )
  	user = cytosis.results['Accounts'][0]['fields']

    // console.log('comparing:', user, token)

    const _token = user.token.split('--')[1] // stored tokens come in the form of {tokenId}--{hashtoken}

		const compare = await comparePasswords(token, _token)
		if ((user.tokenExpires > Date.now()) && compare) {


	  	if(_activateUser)
	  		user = await activateUser(user)

      if(_deleteTokens)
	  	  user = await deleteTokensFromUser(user)

      return user
		}
	}

  return undefined
}



export const addUser = async (user) => {
  // ensure password is hashed (sso won't have passwords)
  if(user.password)
    user.password = await hashPassword(user.password)

  const token = await getShortToken(12)
  user['_phid'] = `u-${token}` // unique phage id
  user['id'] = user.id || user._phid // use phage id as record id if it doesn't exist yet

  // console.log('add user:::::', user)
	// console.log('adding user:', user)
	const record = await save({
		tableName: 'Accounts',
		payload: user,
	})

  return record['fields']
}


export const resetPasswordFromToken = async (token, plaintextPassword) => {
  const user = await findUserByToken(token, {deleteTokens: true})
  // console.log('Reset password:', token, plaintextPassword, user)

  if(!user)
  	return false

  // user.password = await hashPassword(plaintextPassword)
  let password = await hashPassword(plaintextPassword)

	const record = save({
		tableName: 'Accounts',
		recordId: user.recordId,
		payload: {
      password,
    },
	})

  // clearUserIdCache(user.id) // make sure id cache cleared

  return sanitizeUserForClient(user)
}



export const deleteTokensFromUser = async (user) => {
  // clear the token fields non-destructively
  const record = await save({
    tableName: 'Accounts',
    recordId: user.recordId,
    payload: {
      token: '',
      tokenId: '',
      tokenExpires: '',
      // verifyExpires: '',
      // verifyToken: '',
      // verifyShortToken: '',
      // verifyChanges: '',
      resetExpires: '',
      resetToken: '',
      // resetShortToken: '',
    },
  })

  clearUserIdCache(user.id) // make sure id cache cleared

  return user

  // this doesn't work on read-only fields like formulas and lookups
	// magic link tokens
  // delete user.token;
  // delete user.tokenExpires;

  // // not used; from feathers; using a simpler 'token' instead
  // delete user.verifyExpires;
  // delete user.verifyToken;
  // delete user.verifyShortToken;
  // delete user.verifyChanges;

  // delete user.resetExpires;
  // delete user.resetToken;
  // delete user.resetShortToken;

  // const record = await save({
  // 	tableName: 'Accounts',
  // 	recordId: user.recordId,
  // 	payload: user,
  //   insertOptions: ['typecast', 'replace']
  // })

  // clearUserIdCache(user.id) // make sure id cache cleared

  // return user
}



export const activateUser = async (user) => {
	// activate a user's account
	// ** this is meant to be a modular fn

  user['activeStatus'] = 'Active';

	const record = await save({
		tableName: 'Accounts',
		recordId: user.recordId,
		payload: user,
	})

  clearUserIdCache(user.id) // make sure id cache cleared

  return record['fields']
}


// will overwrite previous tokens
// opts {
//    tokenName: 'token', // name of token field (token, resetToken, verifyToken, ...)
//    tokenExpires: 'tokenExpires', // name of expiry field (tokenExpires, resetExpires)
// }
export const createUserToken = async (user, opts={}) => {
  const tokenId = await getShortToken(8)
  const token = await getToken(10)
  const hashToken = await hashPassword(token)
  const tokenExpires = Date.now() + 60*60*1000 // 1 hour exp

  // allows for flexible token storage
  const tokenName = opts['tokenName'] || 'token'
  const expiryName = opts['tokenExpires'] || 'tokenExpires'

  // console.log('adding tokens to user:', token, hashToken, tokenExpires, user)

  const record = await save({
    tableName: 'Accounts',
    recordId: user.recordId,
    payload: {
      [tokenName]: `${tokenId}--${hashToken}`, // store the hashtoken w/ token ID for easier finding
      [expiryName]: tokenExpires,
    },
  })

  clearUserIdCache(user.id) // make sure id cache cleared

  return {
    tokenId,
    token: `${tokenId}--${token}`, // tokenId used as identifier
    hashToken,
    tokenExpires,
  }
}


































/*

	Passport setup

	note this also needs to be setup on Sapper's server.js as middleware
	- import passport from server.js
	- initialize passport and session
	- add passport to sapper.middleware

  https://scotch.io/tutorials/easy-node-authentication-linking-all-accounts-together

*/

// used by passport for sessions / cookie token
// here we use the "id" as the cookie identifier
passport.serializeUser((_user, cb) => {
	return cb(null, _user.id);
})
passport.deserializeUser(async (_userId, cb) => {
	// return cb(null, u);
	const user = await findUserById(_userId)
  cb(null, (user ? user : false))
})




// can configure this to work w/ Fauna or even Airtable
passport.use(new LocalStrategy({
  usernameField: 'email',
  passReqToCallback: true
}, async (req, email, password, cb) => {
  let user
  if (!req.user) { // is the user signed in? if not, this is to sign up or log in
    user = await findUserByEmail(email)
    let passwordCompare

    // console.log('local passport', user, user.password)
    try {
      passwordCompare = await comparePasswords(password, user.password)
    } catch (e) {
      user = undefined
      console.error('Unsuccessful login compare', e)
      // unsuccessful login
    }
  } else { // adding email/password to existing oauth-based account
    user = req.user
    user['email'] = email
    user['password'] = await hashPassword(password)

    await save({
      tableName: 'Accounts',
      recordId: user.recordId,
      payload: user,
    })
    clearUserIdCache(user.id)
  }

  cb(null, user);
}));


// // Google login strat
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: `http://localhost:${process.env.PORT}/auth/google-callback`,
//   passReqToCallback: true
// }, async (req, accessToken, refreshToken, profile, cb) => {
//   let user
//   if (!req.user) { // is the user signed in? if not, this is to sign up or log in
//     // does this oauth profile exist somewhere?
//     user = await findUserByOauth(profile.id) 
//     if(!user) { // new user
//       user = await addUser({
//         email: profile.email,
//         fullName: profile.displayName,
//         profiles: { google: profile },
//       })
//     }
//   } else { // connecting oauth to existing account
//     user = req.user
//     // add details to profile
//     user['profiles'] = {... JSON.parse(user.profiles||'{}'), ... { google: profile }}
//     await save({
//       tableName: 'Accounts',
//       recordId: user.recordId,
//       payload: user,
//     })
//   }
//   clearUserIdCache(user.id)
//   cb(null, user)
// }));

// Twitter login strat
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: `${process.env.DEPLOY_URL}/auth/twitter-callback` || `http://localhost:${process.env.PORT}/auth/twitter-callback`,
  passReqToCallback: true
}, async (req, token, tokenSecret, profile, cb) => {
  let user
  if (!req.user) { // is the user signed in? if not, this is to sign up or log in
    // does this oauth profile exist somewhere?
    user = await findUserByOauth(profile.id) 
    if(!user) { // new user

      user = await addUser({
        email: profile.email,
        fullName: profile.displayName,
        profiles: { twitter: profile },
      })

      
      await addProfileForNewUser(user)
    }
  } else { // connecting oauth to existing account
    user = req.user
    // add details to profile
    user['profiles'] = {... JSON.parse(user.profiles||'{}'), ... { twitter: profile }}
    await save({
      tableName: 'Accounts',
      recordId: user.recordId,
      payload: user,
    })
  }
  clearUserIdCache(user.id)
  cb(null, user)
}))

// // Github login strat
// passport.use(new GithubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: `http://localhost:${process.env.PORT}/auth/github-callback`,
//   passReqToCallback: true
// }, async (req, accessToken, refreshToken, profile, cb) => {
//   let user

//   if (!req.user) { // is the user signed in? if not, this is to sign up or log in
//     // does this oauth profile exist somewhere?
//     user = await findUserByOauth(profile.id) 
//     if(!user) { // new us

//       user = await addUser({
//         email: profile.emails[0].value,
//         fullName: profile.displayName,
//         profiles: { github: profile },
//       })
//     }
//   } else { // connecting oauth to existing account
//     user = req.user
//     // add details to profile
//     user['profiles'] = {... JSON.parse(user.profiles||'{}'), ... { github: profile }}
//     await save({
//       tableName: 'Accounts',
//       recordId: user.recordId,
//       payload: user,
//     })
//   }
//   clearUserIdCache(user.id)
//   cb(null, user)
// }));


// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: `http://localhost:${process.env.PORT}/auth/facebook-callback`,
//   passReqToCallback: true
// }, async (req, accessToken, refreshToken, profile, cb) => {
//   let user
//   if (!req.user) { // is the user signed in? if not, this is to sign up or log in
//     // does this oauth profile exist somewhere?
//     user = await findUserByOauth(profile.id) 
//     if(!user) { // new user
//       user = await addUser({
//         email: profile.email,
//         fullName: profile.displayName,
//         profiles: { facebook: profile },
//       })
//     }
//   } else { // connecting oauth to existing account
//     user = req.user
//     // add details to profile
//     user['profiles'] = {... JSON.parse(user.profiles||'{}'), ... { facebook: profile }}
//     await save({
//       tableName: 'Accounts',
//       recordId: user.recordId,
//       payload: user,
//     })
//   }
//   clearUserIdCache(user.id)
//   cb(null, user)
//  //  let newUser = {
//  //    id: `facebook/${profile.id}`,
//  //    email: profile.email,
//  //    fullName: profile.displayName,
//  //    profile,
//  //    tokens: { accessToken, refreshToken },
//  //  };

//  //  // find existing users
//  //  // const curUser = users.find(u => u.id === newUser.id)
//  //  const curUser = await findUserById(newUser.id)

// 	// if(!curUser) { // create one if not found
//  //  	newUser = await addUser(newUser)
// 	// }

//  //  cb(null, curUser || newUser)
// }));

// passport.use(new OrcidStrategy({
//   clientID: process.env.ORCID_CLIENT_ID,
//   clientSecret: process.env.ORCID_CLIENT_SECRET,
//   callbackURL: `http://localhost:${process.env.PORT}/auth/orcid-callback`,
//   passReqToCallback: true
// }, async (req, accessToken, refreshToken, params, profile, cb) => {

//   let user
//   if (!req.user) { // is the user signed in? if not, this is to sign up or log in
//     // does this oauth profile exist somewhere?
//     user = await findUserByOauth(params.orcid) 
//     if(!user) { // new user
//       user = await addUser({
//         email: params.email,
//         fullName: params.name,
//         profiles: { orcid: params },
//       })
//     }
//   } else { // connecting oauth to existing account
//     user = req.user
//     // add details to profile
//     user['profiles'] = {... JSON.parse(user.profiles||'{}'), ... { orcid: params }}
//     await save({
//       tableName: 'Accounts',
//       recordId: user.recordId,
//       payload: user,
//     })
//   }
//   clearUserIdCache(user.id)
//   cb(null, user)

//  //  let newUser = {
//  //    id: `orcid/${params.orcid}`,
//  //    fullName: params.name,
//  //    profile: params,
//  //    tokens: { accessToken, refreshToken },
//  //  };

//  //  // find existing users
//  //  // const curUser = users.find(u => u.id === newUser.id)
//  //  const curUser = await findUserById(newUser.id)

// 	// if(!curUser) { // create one if not found
//  //  	newUser = await addUser(newUser)
// 	// }

//  //  cb(null, curUser || newUser)
// }));


// passport.use(new LinkedInStrategy.OAuth2Strategy({
//   clientID: process.env.LINKEDIN_KEY,
//   clientSecret: process.env.LINKEDIN_SECRET,
//   callbackURL: `http://localhost:${process.env.PORT}/auth/linkedin-callback`,
//   passReqToCallback: true
//   // scope: ['r_emailaddress', 'r_basicprofile'],
//   // scope: ['r_liteprofile'],
//   // scope: ['r_basicprofile'],
// }, async (req, accessToken, refreshToken, profile, cb) => {

//   let user
//   if (!req.user) { // is the user signed in? if not, this is to sign up or log in
//     // does this oauth profile exist somewhere?
//     user = await findUserByOauth(profile.orcid) 
//     if(!user) { // new user
//       user = await addUser({
//         email: profile.email,
//         fullName: profile.name,
//         profiles: {linkedin: profile },
//       })
//     }
//   } else { // connecting oauth to existing account
//     user = req.user
//     // add details to profile
//     user['profiles'] = {... JSON.parse(user.profiles||'{}'), ... { linkedin: profile }}
//     await save({
//       tableName: 'Accounts',
//       recordId: user.recordId,
//       payload: user,
//     })
//   }
//   clearUserIdCache(user.id)
//   cb(null, user)

//   // console.log('linkedin strategy:', profile)
//   // let newUser = {
//   //   id: `linkedin/${profile.id}`,
//   //   fullName: `${profile.displayName}`,
//   //   profile: profile,
//   //   tokens: { accessToken, refreshToken },
//   // };

//   // // find existing users
//   // // const curUser = users.find(u => u.id === newUser.id)
//   // const curUser = await findUserById(newUser.id)

//   // if(!curUser) { // create one if not found
//   //   newUser = await addUser(newUser)
//   // }

//   // cb(null, curUser || newUser)
// }))




  // DOESN'T WORK — Protocolsio doesn't support localhost
// passport.use(new ProtocolsioStrategy({
// 	state: true,
// 	scope: 'readwrite',
//   clientID: process.env.PROTOCOLSIO_CLIENT_ID,
//   clientSecret: process.env.PROTOCOLSIO_CLIENT_SECRET,
//   callbackURL: `localhost:${process.env.PORT}/auth/protocolsio-callback` // Protocols doesn't play nice with localhost
//   // callbackURL: `http://localhost:${process.env.PORT}/auth/protocolsio-callback`
// }, async (accessToken, refreshToken, params, profile, cb) => {

//   const newUser = {
//     id: `protocolsio/${params.orcid}`,
//     fullName: params.name,
//     params,
//     tokens: { accessToken, refreshToken },
//   };

//   // find existing users
//   // const curUser = users.find(u => u.id === newUser.id)
//   const curUser = await findUserById(newUser.id)

// 	if(!curUser) { // create one if not found
//   	await addUser(newUser)
// 	}

//   cb(null, curUser || newUser)
// }));



