

/*

	Auth Templates — send, email, etc.

	Last updated: 9/30/2020

*/


import { getToken, getShortToken, hashPassword, comparePasswords } from './auth-helpers.js'
import { findUserByEmail, createUserToken } from './auth-users.js'

import { notify } from '../mailer.js'

const fromName = process.env.MG_NAME || 'Phage Directory'





const getResetMessage = ({email, token, host}) => `
  You are receiving this because you (or someone else) have requested the reset of the password for your account.
  Please click on the following link, or paste this into your browser to complete the process:
  http://${host}/account/new-password?token=${token}

  If you did not request this email, please ignore this email and your password will remain unchanged.
`

// creates token, sends reset email, and sends back a hashed token with expiration
export const notifyReset = async (email, host, sendEmail=true) => {
	const user = await findUserByEmail(email)
	const {token, hashToken, tokenExpires} = await createUserToken(user)

	if(sendEmail) {
		await notify({
			subject: 'Password reset request',
			html: getResetMessage({email, token, host}),
			text: getResetMessage({email, token, host}),
			fromName: fromName,
			to: email,
		})
	}

	return {
		hashToken,
		tokenExpires,
	}
}





const getResetConfirmation = ({email}) => `
	This is a confirmation that the password for your account "${email}" has just been changed.

	If you believe you are receiving this message in error, of if you have not requested a password change, please reset your password immediately.
`

export const notifyResetConfirmation = async (email) => {

	await notify({
		subject: 'Your password has been changed',
		html: getResetConfirmation({email}),
		text: getResetConfirmation({email}),
		fromName: fromName,
		to: email,
	})

	return true
}





const getNotifyMessage = ({email, token, host}) => `
  You have requested a link to log into your account.
  Please click on the following link, or paste this into your browser to login to your account:
  http://${host}/account/magic-email?token=${token}
  If you did not request this, please ignore this email.
`

// creates token, sends reset email, and sends back a hashed token with expiration
export const notifyMagic = async (email, host) => {
	const user = await findUserByEmail(email)
	const {token, hashToken, tokenExpires } = await createUserToken(user)

	await notify({
		subject: 'Login request',
		html: getNotifyMessage({email, token, host}),
		text: getNotifyMessage({email, token, host}),
		fromName: fromName,
		to: email,
	})

	return {
		hashToken,
		tokenExpires,
	}
}




const getActivateMessage = ({email, token, host}) => `
  Thanks for signing up!
  Please click on the following link, or paste this into your browser to activate your account:
  http://${host}/account/activate-account?token=${token}
  If you did not request this, please ignore this email.
`

// creates token, sends reset email, and sends back a hashed token with expiration
export const notifyActivate = async (email, host) => {
	const user = await findUserByEmail(email)
	const {token, hashToken, tokenExpires } = await createUserToken(user)

	await notify({
		subject: 'Activate account',
		html: getActivateMessage({email, token, host}),
		text: getActivateMessage({email, token, host}),
		fromName: fromName,
		to: email,
	})

	return {
		hashToken,
		tokenExpires,
	}
}


