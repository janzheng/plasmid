
/* 

  Pocket utilities + helpers
  - for client + server

*/

import { writable } from "svelte/store";
import PocketBase from 'pocketbase';

const pocket = new PocketBase('https://pocket.phage.directory');

// persistent user login
// import this to check if user is logged in
export let User = writable({});

// catch this elsewhere with e.response
export const userLogin = async (email, pass) => {
  let user = await pocket.Users.authViaEmail(email, pass);
  if (user) {
    User.set(user)
    return User
  }
}
// use in server endpoint for session
export const userLoginEndpoint = async (email, pass) => {
  return await pocket.Users.authViaEmail(email, pass);
}




// catch this elsewhere with e.response
export const userSignup = async (_user) => {
  // user = await pocket.Users.get({
  //   email: "zoinks@example.com",
  //   password: "123456789",
  //   passwordConfirm: "123456789",
  // });

  let user = await pocket.Users.create(_user);
  if (user) {
    User.set(user)
    return User
  }
}
// use in server endpoint for session
export const userSignupEndpoint = async (_user) => {
  return await pocket.Users.create(_user);
}



// catch this elsewhere with e.response
export const requestReset = async (email) => {
  let req = await pocket.Users.requestPasswordReset(email)
  console.log('req:', req)
  return true
}

// catch this elsewhere with e.response
export const confirmReset = async (token, password) => {
  let user = await pocket.Users.confirmPasswordReset(token, password, password)
  if (user) {
    User.set(user)
    return User
  }
}
export const confirmResetEndpoint = async (token, password) => {
  return await pocket.Users.confirmPasswordReset(token, password, password)
}




















// let authData

// async function getAuth() {
//   authData = await pocket.Admins.authViaEmail("janeazy@gmail.com", "cN*px8.Bw6Dhjve3tay7E@QF")
//   console.log('auth::', authData)
// }

// async function makeUser() {
//   // create user
//   let user
//   try {
//     user = await pocket.Users.get({
//       email: "zoinks@example.com",
//       password: "123456789",
//       passwordConfirm: "123456789",
//     });
//   } catch (e) {
//     console.error('error::::', e.response.data)
//   }

//   if (user) {
//     console.log('user :: ', user)
//     // set user profile data
//     let updatedRecord = await pocket.Records.update("profiles", user.profile.id, {
//       name: "test",
//     });
//   }

//   // updatedRecord()

// }


// async function login() {
//   // create user
//   let user
//   try {
//     user = await pocket.Users.authViaEmail("zoinks@example.com", "123456789");
//   } catch (e) {
//     console.error('login error::::', e)
//   }

//   if (user) {
//     console.log('user :: ', user)
//     // set user profile data
//     let updatedRecord = await pocket.Records.update("profiles", user.user.profile.id, {
//       name: "woof woo!!!f",
//       nickname: "cool beans"
//     });
//   }

//   // updatedRecord()

// }





// getAuth()
// makeUser()
// login()

