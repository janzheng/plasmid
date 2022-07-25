
/* 

  Pocket utilities + helpers
  - for client + server

*/
import PocketBase from 'pocketbase';

const client = new PocketBase('https://pocket.phage.directory');

// persistent user login — use Session, not a custom store
// make sure Locals is also being set, or Session will be overwritteb by hooks
// set session wherever you request userLogin, etc.

// catch this elsewhere with e.response
export const userLogin = async (email, pass) => {
  let user = await client.Users.authViaEmail(email, pass);
  return user
}
// use in server endpoint for session
export const userLoginEndpoint = async (email, pass) => {
  return await client.Users.authViaEmail(email, pass);
}












// export const test = async () => {
//   let authData = await client.Admins.authViaEmail("janeazy@gmail.com", "cN*px8.Bw6Dhjve3tay7E@QF")
//   const collections = await client.Records.getFullList("profiles", 200 /* batch size */, { sort: "-created" });
// console.log('testtest:', collections)
// }

export const getAvatar = (file, size=`100x100`) => {
  if(file)
    return `https://pocket.phage.directory/api/files/p36XqM89RQKxYld/ajq5LIClQCPNynY/${file}?thumb=${size}`
  return null
}




// catch this elsewhere with e.response
export const userSignup = async (_user) => {
  // user = await pocket.Users.get({
  //   email: "zoinks@example.com",
  //   password: "123456789",
  //   passwordConfirm: "123456789",
  //   profile: {
  //     username: "yawnxyz",
  //   }
  // });

  let user = await client.Users.create(_user)
  if (user) {
    await client.Users.authViaEmail(_user.email, _user.password);

    if(_user.profile) {
      const updatedRecord = await client.Records.update("profiles", user.profile.id, _user.profile);
      user['profile'] = updatedRecord
    }

  }
  console.log('new user object:', user)
  return user
}
// use in server endpoint for session
// export const userSignupEndpoint = async (_user) => {
//   return await client.Users.create(_user);
// }






// set user profile data
/* formdata for avatars

    const formData = new FormData();
    formData.append("avatar", file);
    const updatedRecord = await client.Records.create("demo", "RECORD_ID", formData);

 */
export const updateProfile = async (user, profile, avatar) => {
  // user must be logged in, e.g. client.Users needs to be authorized (elsewhere)
  if (avatar) {
    var avatarFile = new File([avatar], 'avatar.jpg', {
      type: "image/jpeg",
    });
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    return await client.Records.update("profiles", user.profile.id, formData);
  }

  return await client.Records.update("profiles", user.profile.id, profile);
}




// catch this elsewhere with e.response
export const requestPasswordReset = async (email) => {
  let req = await client.Users.requestPasswordReset(email)
  return true
}

// catch this elsewhere with e.response
export const confirmPasswordReset = async (token, password) => {
  let user = await client.Users.confirmPasswordReset(token, password, password)
  if (user) {
    session.set(user)
    return user
  }
}
export const confirmResetEndpoint = async (token, password) => {
  return await client.Users.confirmPasswordReset(token, password, password)
}




// catch this elsewhere with e.response
export const requestEmailChange = async (newEmail, oldEmail, pass) => {
  // try {
    let user = await client.Users.authViaEmail(oldEmail, pass)
    let req = await client.Users.requestEmailChange(newEmail)
    return true
  // } catch (e) {
  //   console.error('[requestEmailChange] error:', e, e.response)
  // }
}

// catch this elsewhere with e.response
export const confirmEmailChange = async (token, password) => {
  let user = await client.Users.confirmEmailChange(token, password, password)
  if (user) {
    session.set(user)
    return user
  }
}








