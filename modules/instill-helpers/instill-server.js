
/* 

*/

import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { json } from '@sveltejs/kit';
import { baseConfig } from '$instill/instill-config'
import { 
  getPosts, 
  getComments,
  editComment, 
  postComment, 
  getProfile, getProfiles,
  getTopics, 
  updateCreateProfile, 
  validatePassword, 
  getProfileByEmail,
  validateTurnstile,
  triggerEvent,
} from '$instill-helpers/instill'

import { hashPassword, comparePasswords, maskPassword } from "$plasmid/utils/auth/auth-helpers"










// 
// 
//  SERVER-SIDE ROUTES + ACTIONS
// 
// 


/* 

  Spaces / Posts

*/

// load layout data for Instill layout component
export async function loadLayoutData({ params, url }) {
  return params
  // let paramsArray = params?.space?.split('/') || []
  // let spaceName = paramsArray[0] || null

  // // let comments = await getComments()
  // let comments = await getPosts(spaceName)

  // // console.log('getting all comments:', comments.length)

  // // spaceName is also just the slug
  // return { comments, spaceName, subpaths: paramsArray.slice(1) };
}

// load a space by the slug (name of the space as param)
export async function loadSpaceSlug({ params, url }) {
  let paramsArray = params?.space?.split('/') || []
  let spaceName = paramsArray[0] || null

  // let comments = await getComments()
  let comments = await getPosts(spaceName)

  // get profiles by space, or all profiles
  // getProfiles(spaceName)
  let profileData = await getProfiles()

  // console.log('getting all comments:', comments.length)

  // spaceName is also just the slug
  return { comments, spaceName, profiles: profileData.profiles, subpaths: paramsArray.slice(1) };
}


export let spaceActions = {
  formHandler: async ({ request, parent }) => {
    try {
      const form = await request.formData();
      const formJson = Object.fromEntries(form.entries());
      const { Username, Password, PollVote, Vote, MarkAsAnswer } = formJson;
      // console.log('formJson', formJson)

      const space = formJson['Space'] ? JSON.parse(formJson['Space']) : null;

      console.log('[spaceActions] Data', formJson, 'poll?', PollVote, 'vote?', Vote, 'mark?', MarkAsAnswer )

      if (baseConfig.settings.useTurnstile) {
        let turnstileResp = await validateTurnstile(form.get('cf-turnstile-response'))
        if (turnstileResp.success === false) {
          return turnstileResp
        }
      }

      let profile = await validatePassword({ id: Username, Passphrase: Password }, true)
      if (!profile || profile === false) {
        return {
          success: false,
          error: "Invalid username or password",
          formJson, // return to re-populate form
        }
      }

      // make sure formJson has the user's Username, not their email address
      formJson.Username = profile.Username


      // handle poll votes
      if (PollVote) {
        let JsonArr = { Username: profile.Username, PollVote }
        let event = await triggerEvent({
          EventType: 'PollVote',
          DataType: 'Number',
          Username: 'arrayed',
          Posts: formJson.Posts,
          JsonArr,
        })

        return {
          success: true,
          event,
        }
      }

      // handle mark as answer votes
      else if (MarkAsAnswer) {
        let event = await triggerEvent({
          EventType: 'MarkAsAnswer',
          DataType: 'Number',
          Username: profile?.Username || 'anonymous',
          Posts: formJson.Posts
        })

        return {
          success: true,
          event,
        }
      }


      // handle mark as answer votes
      else if (Vote) {
        let event = await triggerEvent({
          EventType: 'Vote',
          DataType: 'Number',
          Username: profile?.Username || 'anonymous',
          Posts: formJson.Posts,
        })

        return {
          success: true,
          event,
        }
      }

      let comment
      if (formJson.RecordId) {
        comment = await editComment(formJson, formJson.RecordId, true)

        if (comment.error) {
          return {
            success: false,
            comment,
            error: comment.error,
          }
        }
      } else if (formJson.PostType) { // w/o this you'll end up adding lots of erroneous post types
        formJson.Username = profile.Username
        comment = await postComment(formJson, space)
      }

      return {
        success: true,
        comment,
      }

    } catch (err) {
      // throw errorjson(500, err)
      console.log('[Comments/actions/default] error:', err?.message || err)
      return {
        error: err?.message || err,
      };
    }

  }
};




/* 

  Profile

*/

// Gets a user profile from slug
export async function loadProfileSlug({ params, url }) {
  let paramsArray = params?.slug?.split('/') || []
  let slug = paramsArray[0] || null

  let promiseResults = await Promise.all([
    await getProfile(slug, baseConfig?.settings?.getPdProfile || false),
    paramsArray[1] !== 'edit' ? await getTopics(null, { username: slug }) : null
  ])
  let profile = promiseResults[0]
  let topics = promiseResults[1]

  return { profile, topics, slug, subpaths: paramsArray.slice(1) };
}

// Server-side Profile Actions
// instill/profiles/page.server.js
export let profileActions = {
  passwordCheck: async ({ request }) => {
    const form = await request.formData();
    const formJson = Object.fromEntries(form.entries());
    const { Username, Password } = formJson;
    // console.log('passwordCheck', formJson, Username, Password)


    let validatePass
    if (Username.includes('@')) {
      validatePass = await validatePassword({ id: Username, idField: "Email", Passphrase: Password }, true)
    } else {
      validatePass = await validatePassword({ id: Username, Passphrase: Password }, true)
    }

    if (validatePass === false) {
      return {
        success: false,
        error: "Invalid username/email or password"
      }
    }

    return {
      success: true
    }
  },
  updateProfile: async ({ request }) => {
    try {
      const form = await request.formData();
      const formJson = Object.fromEntries(form.entries());
      const { Username, verifyPassword } = formJson;

      delete formJson['verifyPassword']

      if (formJson['ProfileImage'] && !formJson['ProfileImage'].includes('http')) {
        delete formJson['ProfileImage']
      }
      if (formJson['CoverImage'] && !formJson['CoverImage'].includes('http')) {
        delete formJson['CoverImage']
      }

      // use the real value (this includes null vs. empty string)
      formJson['Password'] = form.get('Password')
      formJson['Email'] = form.get('Email')

      let profile = await updateCreateProfile({
        Username, Password: verifyPassword,
        Profile: formJson,
        isNew: false
      })

      return {
        success: true,
        profile
      }
    } catch (e) {
      return {
        success: false,
        message: e.message
      }
    }

  },
  emailCheck: async ({ request }) => {
    const form = await request.formData();
    const formJson = Object.fromEntries(form.entries());
    const { Email } = formJson;

    let profile = await getProfileByEmail(Email)
    if (!profile) {
      return {
        found: false
      }
    }

    return {
      found: true
    }
  },

  register: async ({ request }) => {
    const form = await request.formData();
    const Profile = Object.fromEntries(form.entries());


    /* set requirements for new profile */
    if (
      !Profile?.Name ||
      !Profile?.Email ||
      !(Profile?.Passphrase || Profile?.Password)
    ) {
      return json({
        success: false,
        message: 'Missing required values for new user (name, email, passphrase)'
      })
    }

    let profile = await updateCreateProfile({
      Profile,
      isNew: true,
    })

    if (profile?.error) {
      return profile
    } else {
      return {
        success: true,
        profile,
        message: profile?.message
      }
    }

  },

};







// 
// 
//  SERVER-SIDE ROUTES
// 
// 

/* 

  Comments / "Posts"
  (unfortunately named "comments")

*/

/* 

  gets all comments
  - http://localhost:3051/comments/api/comments

  gets comments/replies for a specific topic:
  - http://localhost:3051/comments/api/comments?rootId=first-topic--rec2tjW4VbNdjFA2I

*/

export const commentsEndpoints = {
  GET: async (req) => {
    let { rootId } = Object.fromEntries(req.url.searchParams)
    return json(await getComments(rootId))
  },
  POST: async ({ params, request }) => {
    let data = await request.json()
    let { Username, Password } = data

    if (await validatePassword({ id: Username, Passphrase: Password }) === false) {
      return json({
        success: false,
        error: "Invalid username or password"
      })
    }

    let comment = await postComment(data, data.Space)

    return json({
      success: true,
      comment,
    })
  }
}


/* 

  Edit posts (comments, topics, chat)

*/
export const editEndpoints = {
  POST: async ({ params, request }) => {
    let data = await request.json()
    let { Username, Password } = data

    if (await validatePassword({ id: Username, Passphrase: Password }) === false) {
      return json({
        success: false,
        error: "Invalid username or password"
      })
    }

    let post = await editComment(data, data.recordId)

    return json({
      success: true,
      post,
    })
  }
}

export const markAsAnswerEndpoints = {
  POST: async ({ params, request }) => {
    try {
      let data = await request.json()
      let { Username, Password,
        isAnon,
        Posts, // array of post IDs / post Name — this is what you're voting on
      } = data

      let profile
      if (!isAnon) {
        profile = await validatePassword({ id: Username, Passphrase: Password }, true)
        if (!profile) {
          return json({
            success: false,
            error: "Invalid username or password"
          })
        }
      }

      let event = await triggerEvent({
        EventType: 'MarkAsAnswer',
        DataType: 'Number',
        Username: profile?.Username || 'anonymous',
        Posts,
      })

      return json({
        success: true,
        event,
      })
    } catch (err) {
      console.error(err.message || err)
      return errorjson(500, err.message || err)
    }
  }
}


/* 

  Vote for a poll

*/
export const pollvoteEndpoints = {
  POST: async ({ params, request }) => {
    try {
      let data = await request.json()
      let { Username, Password,
        isAnon,
        Posts, // array of post IDs / post Name — this is what you're voting on
        PollVote, // string of the option to vote for; won't be aggregated if not a real option
      } = data


      let profile
      if (!isAnon) {
        profile = await validatePassword({ id: Username, Passphrase: Password }, true)
        if (!profile) {
          return json({
            success: false,
            error: "Invalid username or password"
          })
        }
      }

      // console.log('using profile:', profile)

      let JsonArr = { Username: profile?.Username || 'anonymous', PollVote }
      let event = await triggerEvent({
        EventType: 'PollVote',
        DataType: 'Number',
        Username: 'arrayed',
        Posts,
        JsonArr,
      })

      return json({
        success: true,
        event,
      })
    } catch (err) {
      console.error(err.message || err)
      return errorjson(500, err.message || err)
    }
  }
}


/* 

  Gets Instill Profiles; optionally get PD profiles

*/
export const profilesEndpoints = {
  GET: async (req) => {
    let { slug, space, pd } = Object.fromEntries(req.url.searchParams)

    if (slug)
      return json(await getProfile(slug, pd))

    if (space)
      return json(await getProfiles(space))

    // returns all profiles associated with the Base / db
    return json(await getProfiles())
  },
  PATCH: async ({ params, request }) => {
    try {
      let data = await request.json()
      let { Username, Password, Profile, isNew // if given, this will set the new value
      } = data

      let profile = await updateCreateProfile({
        Username, Password,
        Profile,
        isNew
      })

      return json({
        success: !profile.error,
        profile,
        message: profile?.message
      })
    } catch (err) {
      console.error(err.message || err)
      return errorjson(500, err.message || err)
    }
  },
  POST: async ({ params, request }) => {
    try {
      let data = await request.json()
      let { Profile } = data

      /* set requirements for new profile */
      if (
        !Profile?.Name ||
        !Profile?.Email ||
        !(Profile?.Passphrase || Profile?.Password)
      ) {
        return json({
          success: false,
          message: 'Missing required values for new user (name, email, passphrase)'
        })
      }

      let profile = await updateCreateProfile({
        Profile,
        isNew: true,
      })

      return json({
        success: !profile.error,
        profile,
        message: profile?.message
      })
    } catch (err) {
      console.error(err.message || err)
      return errorjson(500, err.message || err)
    }
  }
}


/* 

  Gets topics from Playground > Comments experiment

*/
export const topicsEndpoints = {
  /* 
  
    gets all comments
    - http://localhost:3051/comments/api/comments
  
    gets comments/replies for a specific topic:
    - http://localhost:3051/comments/api/comments?topicId=article-test-2.197.banana
    
  */
  GET: async (req) => {
    let { topicId, postType, channel, space } = Object.fromEntries(req.url.searchParams)
    if (topicId) {
      return json(await getTopic(topicId))
    }
    return json(await getTopics(postType, { channel, space }))
  },
  POST: async ({ params, request }) => {
    try {
      let data = await request.json()
      let { Username, Password, Comment, Topic, Root, PostType, Keywords, Channels, PostStatuses, ImageUrl, Json } = data

      // require Topic 
      // drop the Parent if it exists
      if (!Topic)
        return json({
          success: false,
          error: "Topic required"
        })


      if (await validatePassword({ id: Username, Passphrase: Password }) === false) {
        return {
          success: false,
          error: "Invalid username or password",
          formJson, // return to re-populate form
        }
      }

      let comment = await postComment({
        Username, Comment, Topic, Root, PostType, Keywords, Channels, PostStatuses, ImageUrl, Url, Json
        // drop Parent
        // Comment acts as body
      }, data.Space)

      return json({
        success: true,
        comment,
      })
    } catch (err) {
      console.error(err.message || err)
      return errorjson(500, err.message || err)
    }
  }
}



/* 

  Password Validator
  - Use this to test the password validator; comment out when done
  - Don't deploy to Prod

*/
export const validateEndpoints = {
  // let hashedPassword
  // const getPasswordHash = async() => {
  //   hashedPassword = await hashPassword($commentPassword)
  //   // console.log('??', pass, hashpass, await comparePasswords(pass, hashpass))
  //   return hashedPassword
  // }
  // $: {
  //   $commentPassword = comment?.Password
  //   getPasswordHash()
  //   // console.log('comment', comment)
  // }

  // FOR TESTING ONLY not safe; for testing - spits out hashed version on password
  GET: async (req) => {
    const { password } = Object.fromEntries(req.url.searchParams)
    console.log('hashing', password)
    return json({ 'results': await hashPassword(password) })
  },
  POST: async ({ params, request }) => {
    let data = await request.json()
    let { Username, Passphrase, Password, Email } = data

    let validatePass
    if (Email) {
      validatePass = await validatePassword({ id: Email, idField: "Email", Password, Passphrase }, true)
    } else {
      validatePass = await validatePassword({ id: Username, Password, Passphrase }, true)
    }

    return json({
      profile: validatePass,
    })
  },

  // DUMMY FUNCTIONS — comment these out to enable real functionality
  GET: async (req) => { return json({ 'results': await hashPassword('test') }) },
  POST: async ({ params, request }) => { return json({ 'results': await hashPassword('test') }) }
}



/* 

  Gets topics from Playground > Comments experiment

*/
export const votesEndpoints = {
// no option to get votes; get votes through posts instead
// todo: support anonymous votes?
// handles JSON Post endpoints
  /* 
  
    Data can be:
      empty (triggers an increment)
      ++ (triggers an increment)
      -- (triggers a decrement)
      ## (replaces current value)
  
  */
  POST: async ({ params, request }) => {
    try {
      let data = await request.json()
      let { Username, Password,
        isAnon,
        recordId,
        Posts, // array of post IDs / post Name — this is what you're voting on
        Data, // if given, this will set the new value
        JsonArr, // json objects here will be aggregated to JsonArr field; useful for polls
      } = data

      let profile
      if (!isAnon) {
        profile = await validatePassword({ id: Username, Passphrase: Password }, true)
        if (!profile) {
          return json({
            success: false,
            error: "Invalid username or password"
          })
        }
      }

      let event = await triggerEvent({
        EventType: 'Vote',
        DataType: 'Number',
        Username: profile?.Username || 'anonymous',
        Posts,
        Data,
        JsonArr,
        recordId
      })

      return json({
        success: true,
        event,
      })
    } catch (err) {
      console.error(err.message || err)
      return errorjson(500, err.message || err)
    }
  }
}