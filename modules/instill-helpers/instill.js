

import JSON5 from 'json5'
import { env } from '$env/dynamic/private';
import { validateToken } from '$plasmid/utils/turnstile';
import { cacheClear, cacheXclear } from '$plasmid/utils/cache';
import { hashPassword } from "$plasmid/utils/auth/auth-helpers"
import { getRecordById, getTables, addRecord_v2, flattenRecord, flattenTable, checkPassword } from '$plasmid/utils/airfetch'
// import Cytosis from '$plasmid/utils/cytosis'
import { baseConfig } from '$instill/instill-config'
import { getProfileBySlug } from '$routes/content/api/v3/profiles/+server.js'



export const postsEnv = baseConfig?.posts.env || baseConfig?.posts.baseId || 'AIRTABLE_PRIVATE_BASE'
export const eventsEnv = baseConfig?.events.env || baseConfig?.events.baseId || 'AIRTABLE_PRIVATE_BASE'
export const profilesEnv = baseConfig?.profiles.env || baseConfig?.profiles.baseId || 'V3_DB_BASE'
export const postsTable = baseConfig?.posts.tableName || 'Posts'
export const eventsTable = baseConfig?.events.tableName || 'Events'
export const profilesTable = baseConfig?.profiles.tableName || 'People'





// 
// convenience functions
// 
export const filterBy = (arr, key, value) => {
  return arr.filter((item) => item[key] === value);
};
















// returns OBJECT with {success, error}
export const validateTurnstile = async (turnstile_response) => {

  console.log('[validatingTurnstile] Passed:', turnstile_response, env.TURNSTILE_API)
  const { success, error } = await validateToken(turnstile_response, env.TURNSTILE_API);

  console.log('[validateTurnstile] Passed:', success)
  if (!success) {
    console.log('[validateTurnstile] Unsuccessful:', error)
    if (error == 'missing-input-response') error = "Please refresh the page to complete the CAPTCHA"
    return {
      success: false,
      error: error || 'Invalid CAPTCHA; refresh the page and try again'
    };
  }

  return {success: true}
}



// returns false if failed
export const validatePassword = async ({
  id, Password, Passphrase, idField="Slug", passField="Passphrase", _baseId= env?.[profilesEnv]
}, returnProfile) => {
  let obj = {
    id,
    plaintextPass: Password || Passphrase, // check password first
    idField,
    passField,
    _baseId,
    tableName: profilesTable,
  }
  
  let success
  // check against Passphrase field

  // console.log('validatePw:', id, idField, Password, Passphrase, )

  if(Passphrase) {
    success = await checkPassword(obj, false)
  }

  // check against Password field
  if(!success) {
    obj['passField'] = 'Password'
    success = await checkPassword(obj)
  }

  // check against Email and Password field
  if(!success) {
    obj['idField'] = 'Email'
    obj['passField'] = 'Password'
    success = await checkPassword(obj)
  }

  // don't check against Email / Passphrase, won't be common


  if(returnProfile) {
    delete success['Passphrase']
    delete success['Password']
    return success
  }

  // console.log('[validatePassword] Passed?', success)
  return !!success // undefined if failed to check / auth
}



/* 

  AIRTABLE IMPLEMENTATION
  future: add PocketBase implementation

*/


// if a post has a json field, parse it and return it
// also processes numbers into real numbers and parses embedded JSON in the record
export const extractPostEventData = (post) => {
  try {
    if(!post || !post.Events || !post['Events::json'])
      return
    let json = JSON.parse(post['Events::json'])
    let events = json.events

    // process events
    events = events.map(event => {
      let obj = {
        ...event,
      }
      if(event?.DataType == "Number")
        obj.Data = Number(event.Data)

      if (event?.DataType == "JSON")
        obj.Data = JSON.parse(event.Data)

      return obj
    })
    return events
  } catch(err) {
    console.error(err)
  }

  return
}



// processes the event w/r to the topic; e.g. if the event is "votes", we sum the number of votes
// and attach it back as a "votes" attribute
// extracts the post's events and processes them back into the post
export const processPostEvent = (post, eventData) => {
  if(!eventData)
    return post

  let aggregator = {}
  for (const event of eventData) {
    if (event?.EventType == "Vote") {
      if (!aggregator[event?.EventType]) aggregator[event?.EventType] = 0
      aggregator[event?.EventType] += event?.Data
    }
  }

  return { 
    ...post,
    ...aggregator,
  }
}


// attaches the parsed event data back into the post
export const attachPostsEvents = (posts) => {
  posts = posts.map(post => {
    let eventData = extractPostEventData(post)
    post = {
      ...post,
      ["Events::data"]: eventData,
    }
    post = processPostEvent(post, eventData)
    return post
  })
  return posts
}


// if a post has a json field, parse it and return it as part of the record
// works w/ flattened records only!
// NOTE: fieldname should NOT be "json" or "JSON" as both are reserved words
// "Json" is ok, and can be used for field names and POST variables
// "::json" isn't so good bc it gets weird when passed around as a variable
export const jsonifyRecord = (record, fieldName = 'Json') => {
  try {
    if (!record || !record[fieldName])
      return record
    let json = JSON.parse(record[fieldName])
    return {
      ...record,
      [fieldName]: json
    }
  } catch (err) {
    // console.error('[jsonifyRecord] error:', record, err) // don't handle errors
    // return record
  }

  return record
}

export const jsonifyRecords = (posts) => {
  posts = posts.map(post => {
    return jsonifyRecord(post)
  })
  return posts
}























export const getTopics = async (postType, {channel, space, username}={}) => {

  // using getPosts to get comments and topic data speeds up everything, but bad code practice
  let posts = await getPosts()
  let topics = posts.filter(post => post.Topic && !post.PostType?.includes('Root'))
  
  if (postType) {
    topics = topics.filter(post => post.PostType?.includes(postType))
  }

  // let bases = [{
  //   tables: [postsTable],
  //   options: postType ? {
  //     "view": "Topics",
  //     keyword: `${postType}`,
  //     matchKeywordWithField: 'PostType',
  //     matchStyle: 'exact',
  //   } : { 'view': 'Topics' }
  // }]
  // let tables = await getTables(bases, true, {
  //   _baseId: env?.[postsEnv],
  // })
  // let topics = flattenTable(tables?.[postsTable])

  // filter by channel in js, not in airtable
  if (channel) {
    topics = topics.filter(topic => topic.Channels?.includes(channel))
  }
  if (space) {
    topics = topics.filter(topic => topic.Space?.includes(space))
  }
  if (username) {
    topics = topics.filter(topic => topic.Username?.includes(username))
  }

  // for each topics, extract the event and insert back into the topic
  topics = attachPostsEvents(topics)

  // count comments per topic? 
  // todo: speed up this slow operation
  // method 0: synchronous getting comments, takes forever
  // method 1: still slow: get all comments as promises, then run all of them
  // methof 2: less flexible: get all posts, then filter each by topic
  let arr = []

  // METHOD 2:
  for (const topic of topics) {
    let comments = []
    if (topic.TopicId)
      comments = posts.filter(post => post.RootId?.includes(topic.TopicId))

    // console.log('checking comments for', topic.TopicId, comments.length)
    arr.push({
      topic: jsonifyRecord(topic),
      commentCount: comments.length
      // comments // don't send all comments
    })
  }
  
  // METHOD 0:
  // for (const topic of topics) {
  //   let comments = []
  //   if (topic.TopicId)
  //     comments = await getComments(topic.TopicId)

  //   // console.log('checking comments for', topic.TopicId, comments.length)
  //   arr.push({
  //     topic: jsonifyRecord(topic), 
  //     commentCount: comments.length
  //     // comments // don't send all comments
  //   })
  // }

  return arr
}


// gets a specific topic and comments by its ID
export const getTopic = async (topicId) => {
  let bases = [{
    tables: [postsTable],
    options: {
      "view": "Topics",
      keyword: `${topicId}`,
      matchKeywordWithField: 'TopicId',
      matchStyle: 'exact',
    }
  }]
  let tables = await getTables(bases, true, {
    _baseId: env?.[postsEnv],
  })

  let topic = flattenTable(tables?.[postsTable])?.[0] || null
  let comments = []
  if(topic) {
    topic["Events::data"] = extractPostEventData(topic)
    comments = await getComments(topic?.TopicId)
    topic = jsonifyRecord(topic)
  }

  return {
    topic,
    comments
  }
}


// get all posts by space; similar to get Comments
// this is a temp convenience fn; will return a lot of stuff @ scale
export const getPosts = async (spaceName) => {

  let viewName = 'Posts'
  let bases = [{
    tables: [postsTable],
    options: spaceName ? {
      "view": viewName,
      keyword: `${spaceName}`,
      matchKeywordWithField: 'Space',
      matchStyle: 'exact',
    } : { 'view': viewName }
  }]
  let tables = await getTables(bases, true, {
    _baseId: env?.[postsEnv],
  })
  let posts = flattenTable(tables?.[postsTable])

  // for each topic, extract the event and insert back into the topic
  posts = attachPostsEvents(posts)
  posts = jsonifyRecords(posts)

  // remove posts with status "Delisted"
  posts = posts.filter(post => {
    // posts = posts.filter(post => console.log('post:', post))
    if (post.PostStatuses && post.PostStatuses?.includes('Delisted')) {
    } else {
      return post
    }
  })


  return posts
}



// passing in rootId gets all the comments for the topic
export const getComments = async (rootId) => {
  if (rootId && Array.isArray(rootId) && rootId.length > 0)
    rootId = rootId[0] // lookups tend to be arrays
  if (rootId && Array.isArray(rootId) && rootId.length == 0)
    rootId = null // lookups also tend to pass in empty arrays, so we ignore these
    // root ID could also be strings, but those will pass these checks

  let viewName = 'Comments'
  let bases = [{
    tables: [postsTable],
    options: rootId ? {
      "view": viewName,
      keyword: `${rootId}`,
      matchKeywordWithField: 'RootId',
      matchStyle: 'exact',
    } : { 'view': viewName }
  }]
  let tables = await getTables(bases, true, {
    _baseId: env?.[postsEnv],
  })
  let comments = flattenTable(tables?.[postsTable])

  // for each topics, extract the event and insert back into the topic
  comments = attachPostsEvents(comments)
  comments = jsonifyRecords(comments)
  // console.log('getComments?', rootId, comments.length, comments[0])

  return comments
}


export const postComment = async ({ Username, Comment, Parent, Topic, Root, PostType, Keywords, Channels, PostStatuses, ImageUrl, Url, Json }, Space) => {
  try {
    let obj = {
      // recordId: data.recordId,
      tableName: postsTable,
      payload: {
        PostType,
        PostStatuses: PostStatuses == '' ? null : PostStatuses,
        Space: Space?.name || null,
        Keywords: Array.isArray(Keywords) ? Keywords : Keywords?.split(',') || null, // handles an array of text, or a comma-separated string
        Channels: Array.isArray(Channels) ? Channels : Channels?.split(',') || null, // handles an array of text, or a comma-separated string
        Topic,
        Comment,
        ImageUrl,
        Url,
        Username,
        Root,
        Parent: Parent ? [Parent] : [],
      },
      tableOptions: { insertOptions: ["typecast"] }, // required for Parent pointing w/o ID
      _baseId: env?.[postsEnv],
    }

    console.log('[postComment] Object:', obj )

    let _json
    try {
      Json = Json.trim()
      if(typeof Json === 'string') {
        _json = JSON5.parse(Json)
        // parse each value in _json, since they're still encoded as str, .e.g "Poll"
        for (const key in _json) {
          console.log('parsing each key: ', key)
          try {
            _json[key] = JSON5.parse(_json[key])
          } catch (e) {
            // do nothing; don't parse and skip
          }
        }
      }
      else if (Json)
        _json = Json // maybe it's an object, not a stringified object?
      if (_json)
        obj.payload['Json'] = _json
    } catch(e) {
      console.log('[postComment] Error parsing JSON; ignoring!')
    }
    let res = await addRecord_v2(obj)

    // bust the cache
    // const _cache = `getTables-${view}-${JSON.stringify(bases)}`
    cacheClear() // clear ALL caches for now 

    // console.log('postComment:', flattenRecord(res))
    return flattenRecord(res)
  } catch (err) {
    console.error('[postComment] Error:', err?.message || err)
    return { error: err?.message || err }
  }
}

// separate from postComment to prevent accidental overwrites / edits
// export const getRecord_v2 = async ({ keyword, tableName, fieldName, useCache = false, _apiEditorKey, _baseId }) => {
export const editComment = async ({ Username, Comment, Parent, Topic, Root, PostType, Keywords, Channels, Space, PostStatuses, ImageUrl, Url }, recordId, sameUser=true) => {
  try {
    let rec
    if(sameUser) {
      // makes sure a user is editing their own post
      // future: moderators can bypass this
      rec = await getRecordById({
        recordId: recordId,
        tableName: postsTable,
        _baseId: env?.[postsEnv],
      })
      
      if (rec?.Username != Username) {
        return { error: 'You cannot edit another user\'s post.' }
      }
    }
    
    let res 
    res = await addRecord_v2({
      recordId: recordId,
      tableName: postsTable,
      payload: {
        Topic,
        Username,
        Comment,
        Root,
        PostType,
        PostStatuses: [...PostStatuses.split(','), "Edited"].filter(f=>f&&f),
        Keywords: Array.isArray(Keywords) ? Keywords : Keywords?.split(',') || null, // handles an array of text, or a comma-separated string
        Channels: Array.isArray(Channels) ? Channels : Channels?.split(',') || null, // handles an array of text, or a comma-separated string
        Parent: Parent ? [Parent] : [],
        Space: Space?.name,
        ImageUrl, 
        Url,
      },
      tableOptions: { insertOptions: ["typecast"] }, // required for Parent pointing w/o ID
      // _baseId: env[data?.baseEnvId] || data?.baseId || env.AIRTABLE_PRIVATE_BASE,
      _baseId: env?.[postsEnv],
    })

    // bust the cache
    // const _cache = `getTables-${view}-${JSON.stringify(bases)}`
    cacheClear() // clear ALL caches for now 

    // console.log('postComment:', flattenRecord(res))
    return flattenRecord(res)
  } catch (err) {
    console.error('[editComment] Error:', err?.message || err)
    return { error: err?.message || err }
  }
}




/* 
  Vote (or trigger event) on a post

  Algo:
  1. check if the event exists (same Parent Posts, EventType, and Username)
  2. if it exists, update the event with the new data, or increment the data
  3. if it doesn't exist, create a new event

*/
export const triggerEvent = async (eventData, preCheck=true) => {
  try {
    let record = {
        Data: 0
      }
    let recordId = eventData.recordId
      
    // get existing records
    if (preCheck && !recordId) {
      // find a record where the vote is already registerd
      // then increment or update the vote
      let bases = [{
        tables: [eventsTable],
        options: {
          "view": "Grid view",
          keywords: [eventData.Username],
          matchKeywordWithFields: ['Username'],
          matchStyle: 'exact',
        }
      }]
      let tables = await getTables(bases, false, {
        _baseId: env?.[postsEnv],
      })
      let events = flattenTable(tables?.[eventsTable])
      // console.log('------> events:', events, eventData)
      events = events.filter((evt) => {
        return (
          evt?.DataType == eventData?.DataType
          && evt?.EventType == eventData.EventType
          && (evt?.["::json"] && JSON.parse(evt?.["::json"]).Posts == eventData.Posts)
        )
      })
      // if we find a record, we increment or update this one
      if (events?.length && events?.length > 0) {
        record = events[0]
        recordId = record.id
      }
      // console.log('[triggerEvent] precheck:', record, recordId)
    }




    if (eventData?.Data?.toString().includes('--')) {
      // eventData.Data = eventData.Data.replace('--', '')
      eventData.Data = parseInt(record.Data) - 1
    } else if (eventData?.Data && parseInt(eventData?.Data)) {
      // eventData.Data = eventData.Data.replace('--', '')
      eventData.Data = parseInt(eventData?.Data)
    } else {
      // if (eventData?.Data?.toString().includes('++')) {
        // eventData.Data = eventData.Data.replace('++', '')
      eventData.Data = parseInt(record.Data) + 1
      // }
    }


    // if JsonArr object given, then we add the json object to existing json object as part of the arr: [] field, or we create a new one — this lets us compound poll / form information into a single record
    // console.log('>>>>>', eventData?.JsonArr)
    if (eventData?.JsonArr) {
      let _json

      if (record && record?.["JsonArr"])
        _json = JSON.parse(record?.["JsonArr"])

      if (!_json?.arr) {
        _json = { arr: [] }
      }
      _json.arr.push(eventData.JsonArr)
      eventData["JsonArr"] = JSON.stringify(_json)
    }




    // if no record, create a new one w/ init Data
    // console.log('pushing new data:', recordId, eventData)
    delete eventData?.recordId // messes with insertion
    eventData.Posts = eventData.Posts ? [eventData.Posts] : [] // need to wrap in array
    
    let res = await addRecord_v2({
      recordId,
      tableName: eventsTable,
      payload: {
        ...eventData
      },
      tableOptions: { insertOptions: ["typecast"] }, // required for Parent pointing w/o ID
      // _baseId: env[data?.baseEnvId] || data?.baseId || env.AIRTABLE_PRIVATE_BASE,
      _baseId: env?.[postsEnv],
    })

    // bust the cache
    // const _cache = `getTables-${view}-${JSON.stringify(bases)}`
    cacheClear() // clear ALL caches for now 

    // console.log('[triggerEvent]:', flattenRecord(res))
    let eventRecord = flattenRecord(res)
    eventRecord = jsonifyRecord(eventRecord, 'JsonArr')
    return eventRecord
  } catch (err) {
    console.error('[triggerEvent] Error:', err?.message || err)
    return { error: err?.message || err }
  }
}





export const getProfileByEmail = async (email) => {

  let viewName = 'Published'
  let bases = [{
    tables: [profilesTable],
    options: {
      "view": viewName,
      keyword: `${email}`,
      matchKeywordWithField: 'Email',
      matchStyle: 'exact',
    }
  }]
  let tables = await getTables(bases, true, {
    _baseId: env?.[profilesEnv],
  })
  let profiles = flattenTable(tables?.[profilesTable])

  // for each topics, extract the event and insert back into the topic
  profiles = jsonifyRecords(profiles)

  let profile = profiles && Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null

  if (profile) {
    delete profile?.['Password']
    delete profile?.['Passphrase']
  }

  return profile
}



export const getProfile = async (slug, getPdProfile=false) => {

  let viewName = 'Published'
  let bases = [{
    tables: [profilesTable],
    options: {
      "view": viewName,
      keyword: `${slug}`,
      matchKeywordWithField: 'Slug',
      matchStyle: 'exact',
    }
  }]
  let tables = await getTables(bases, true, {
    _baseId: env?.[profilesEnv],
  })
  let profiles = flattenTable(tables?.[profilesTable])

  // for each topics, extract the event and insert back into the topic
  profiles = jsonifyRecords(profiles)

  let profile = profiles && Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null

  if (profile) {
    delete profile?.['CoverImage'] // takes up data; unused
    delete profile?.['ProfileImage'] // takes up data; unused
    delete profile?.['Email']
    delete profile?.['Password']
    delete profile?.['Passphrase']
  }

  let pd
  if (getPdProfile) {
    pd = await getProfileBySlug(slug, `https://api.phage.directory`)
    if (pd) {
      profile['PhageDirectory'] = pd
    }
  }
  // console.log('getProfile?', slug, profile)

  return profile
}



export const getProfiles = async (spaceName) => {

  // get all profiles
  let viewName = 'Published'
  let bases = [{
    tables: [profilesTable],
    options: { view: viewName }
  }]
  let tables = await getTables(bases, true, {
    _baseId: env?.[profilesEnv],
  })
  let profiles = flattenTable(tables?.[profilesTable])

  // filter further by space 
  if(spaceName) {
    let posts = await getPosts(spaceName)
  
    // if space, get all records w/ the space
    // find all usernames
    let usersBySpace = posts.map((post) => post.Username).filter(user => user)
    // get unique array of usersBySpace
    usersBySpace = [...new Set(usersBySpace)]
  
    profiles = profiles.filter(profile => usersBySpace.includes(profile.Slug))
  }
  
  // delete passwords from all profiles
  profiles = profiles.map(profile => {
    delete profile?.['CoverImage'] // takes up data; unused
    delete profile?.['ProfileImage'] // takes up data; unused
    delete profile?.['Email']
    delete profile?.['Password']
    delete profile?.['Passphrase']
    return profile
  })
  return {profiles, space: spaceName}
}





export const updateCreateProfile = async ({Username, Password, Profile, isNew}) => {
  try {

    if(!isNew && (!Username || !Password)) {
      throw new Error('Username and Password required for non-new accounts')
    }

    let recordHolder, profile, recordId
    if (!isNew && Username && Password) {
      recordHolder = await validatePassword({ id: Username, Passphrase: Password }, true)
      if (!recordHolder) return {error: 'Invalid Username or Password'}
      recordId = recordHolder.id
    }

    let profileData = {
      ...recordHolder,
      ...Profile,
      'Status': 'Published' // only unpublish thru mod tools
    }

    // use this to ALSO handle updating password?
    // delete profileData?.['Password'] ?
    // delete profileData?.['Passphrase'] ?

    delete profileData?.['id']
    delete profileData?.['recordId']
    delete profileData?.['Slug']
    delete profileData?.['Slug:Auto']
    delete profileData?.['Created']
    delete profileData?.['_id']
    delete profileData?.['ProfileImage:Data']
    delete profileData?.['ProfileImage:URL']
    delete profileData?.['CoverImage:Data']
    delete profileData?.['CoverImage:URL']

    console.log('[triggerEvent] Updating with profile data::', profileData)

    if (profileData?.['Password'] === '') {
      delete profileData?.['Password']
    }

    if (profileData.Password) {
      profileData.Password = await hashPassword(profileData.Password)
    }


    let res = await addRecord_v2({
      recordId,
      tableName: profilesTable,
      payload: {
        ...profileData
      },
      tableOptions: { insertOptions: ["typecast"] }, // required for Parent pointing w/o ID
      // _baseId: env[data?.baseEnvId] || data?.baseId || env.AIRTABLE_PRIVATE_BASE,
      _baseId: env?.[profilesEnv],
    })

    // bust the cache
    // const _cache = `getTables-${view}-${JSON.stringify(bases)}`
    cacheClear() // clear ALL caches for now 

    let record = flattenRecord(res)
    delete record?.['Password']
    delete record?.['Passphrase']
    console.log('[updateCreateProfile] Updating record:', record)
    return record
  } catch (err) {
    console.error('[updateCreateProfile] Error:', err?.message || err)
    return { error: err?.message || err }
  }
}



