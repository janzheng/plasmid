/*

	https://gist.github.com/nemtsov/6c2c24fa565a29404b487c61ce5bae4f

	Note: passport's been setup as middleware in Sapper's server.js

*/


import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// import { notifySetup, notify } from '../mailer.js'

// import { addUser, findUserById, findUserByEmail } from './auth-users.js'




































/*

	Mini-helpers inspired by Featers
	https://github.com/feathers-plus/feathers-authentication-management

*/

// https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/clone-object.js
/**
 * Returns new object with values cloned from the original object. Some objects
 * (like Sequelize or MongoDB model instances) contain circular references
 * and cause TypeError when trying to JSON.stringify() them. They may contain
 * custom toJSON() or toObject() method which allows to serialize them safely.
 * Object.assign() does not clone these methods, so the purpose of this method
 * is to use result of custom toJSON() or toObject() (if accessible)
 * for Object.assign(), but only in case of serialization failure.
 *
 * @param {Object?} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const cloneObject = (obj) => {
  let obj1 = obj;

  if (typeof obj.toJSON === 'function' || typeof obj.toObject === 'function') {
    try {
      JSON.stringify(Object.assign({}, obj1));
    } catch (err) {
      obj1 = obj1.toJSON ? obj1.toJSON() : obj1.toObject();
    }
  }

  return Object.assign({}, obj1);
}


// https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/sanitize-user-for-client.js
export const sanitizeUserForClient = (user1) => {
  const user = cloneObject(user1);

  // sometimes we'll just use a single token for verify and reset
  delete user.token;
  delete user.tokenExpires;

  delete user.password;
  delete user.verifyExpires;
  delete user.verifyToken;
  delete user.verifyShortToken;
  delete user.verifyChanges;
  delete user.resetExpires;
  delete user.resetToken;
  delete user.resetShortToken;

  return user;
}

// https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/sanitize-user-for-notifier.js
export const sanitizeUserForNotifier = (user1) => {
  const user = cloneObject(user1);
  delete user.password;
  return user;
}


// https://github.com/feathersjs/feathers/blob/3c2218e633dfb19f430eb539b73afb3f684b6479/packages/authentication-local/src/strategy.ts#L116
export const hashPassword = async (password, saltRounds=10) => {
  const hash = await bcrypt.hash(password, saltRounds);
  return hash
}


// https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/compare-passwords.js
// slightly modified from source code
export const comparePasswords = (plaintextPassword, password) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plaintextPassword, password, (err, data1) =>
      (err || !data1) ? reject(err) : resolve(data1)
    );
  });
}


/* these are for token assembly */
function randomDigits (len) { // https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/random-digits.js
  let str = '';
  while (str.length < len) {
    str += parseInt('0x' + crypto.randomBytes(4).toString('hex')).toString();
  }
  return str.substr(0, len);
}

// changed name from randomBytes
export const getToken = async (len) => { // https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/random-bytes.js
  return new Promise((resolve, reject) => {
    crypto.randomBytes(len, (err, buf) => err ? reject(err) : resolve(buf.toString('hex')));
  });
}

// https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/get-short-token.js
export const getShortToken = async (len, ifDigits) => {
  if (ifDigits) {
    return randomDigits(len);
  }

  const str1 = await getToken(Math.floor(len / 2) + 1);
  let str = str1.substr(0, len);

  if (str.match(/^[0-9]+$/)) { // tests will fail on all digits
    str = `q${str.substr(1)}`; // shhhh, secret.
  }

  return str;
}

// https://github.com/feathers-plus/feathers-authentication-management/blob/master/src/helpers/deconstruct-id.js
// slightly modified
export const deconstructToken = async (token) => {
  if (!token.includes('___')) {
    throw new Error('Token is not in the correct format.');
  }
  return token.slice(0, token.indexOf('___'));
}


