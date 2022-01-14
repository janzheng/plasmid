
// simple POST endpoints

// ex: 	https://github.com/sveltejs/sapper/blob/master/site/src/routes/docs/index.svelte
// 			https://github.com/sveltejs/sapper/blob/master/site/src/routes/docs/index.json.js

// // routes/blog/[slug].json.js
// import db from './_database.js'; // the underscore tells Sapper this isn't a route

// export async function get(req, res, next) {
// 	// the `slug` parameter is available because this file
// 	// is called [slug].json.js
// 	const { slug } = req.params;

// 	const article = await db.get(slug);

// 	if (article !== null) {
// 		res.setHeader('Content-Type', 'application/json');
// 		res.end(JSON.stringify(article));
// 	} else {
// 		next();
// 	}
// }

// import send from '@polka/send';
import Cytosis from 'cytosis';
// import * as sapper from '@sapper/server';
// import { cacheGet, cacheSet, cacheClear } from "@/_utils/cache"
import { sendData } from "@/_utils/sapper-helpers" 
// import { registerSignupStripe, registerPostPaymentStripe, registerBeforePayment, updatePaymentPaypal, completePaymentStripe, updateProfile} from "@/_project/registration" 
// import { addComment, addQuestion, addMessage, unsubscribe } from "@/_project/app-helpers" 

import { _err, _msg, _tr } from '@/_utils/sentry'
import { config } from "dotenv";

// import { notifyAdmins, notifySubscribe, notifyEventSignup } from '../../_utils/_mailer.js'

config(); // https://github.com/sveltejs/sapper/issues/122







export async function post(req, res) {
  const { type } = req.body

	try {

		// console.log('[api/setters] post', type, req.body)
		// // _msg('[api/setters] post', type, req.body)

    // if (type === 'signup') {
		// 	const { data } = await registerSignupStripe(req.body)
    //   return sendData({
    //     data
    //   }, res);
    // }

    // if (type === 'comment') {
		// 	const status = await addComment(req.body)
    //   return sendData({
    //     status
    //   }, res);
    // }

    // if (type === 'message') {
		// 	const status = await addMessage(req.body)
    //   return sendData({
    //     status
    //   }, res);
    // }

    // if (type === 'question') {
		// 	const status = await addQuestion(req.body)
    //   return sendData({
    //     status
    //   }, res);
    // }

    // if (type === 'update_profile') {
		// 	const status = await updateProfile(req.body)
    //   return sendData({
    //     status
    //   }, res);
    // }


    // if (type === 'unsubscribe') {
		// 	const status = await unsubscribe(req.body)
    //   return sendData({
    //     status
    //   }, res);
    // }


    // if (type === 'register_before_payment') {
		// 	let ok

    //   let { data } = await registerBeforePayment(req.body)
    //   return sendData({
    //     data // send data back
    //   }, res);
    
      
    //   sendData({
    //     success: ok // don't send cytosis back, just send empty data to confirm
    //   }, res);
    // }

    // if (type === 'post_payment_stripe') {
		// 	let ok
    //   // if(process.env.PAYMENT_MODE == 'STRIPE') {

    //   let data = await registerPostPaymentStripe(req.body)

    //   return sendData({
    //     ...data // send data back
    //   }, res);
    //     // ok = await registerPostPaymentStripe(req.body)
    //   // } else {
    //   //   let { data } = await registerPostPaymentPaypal(req.body)
    //   //   return sendData({
    //   //     data // send data back
    //   //   }, res);
    //   // }
    //   sendData({
    //     success: ok // don't send cytosis back, just send empty data to confirm
    //   }, res);
    // }


    // if (type === 'update_payment') {
    //   // only implemented for PayPal 
    //   let data = await updatePaymentPaypal(req.body)
    //   if(data)
    //     return sendData(
    //       data // send data back
    //     , res);
    // }

    // if (type === 'complete_stripe') {
    //   // only implemented for PayPal 
    //   let data = await completePaymentStripe(req.body)
    //   // console.log('complete stripe...', data)
    //   if(data)
    //     return sendData(
    //       data // send data back
    //     , res);
    // }

    res.end('The server encountered an error during signup. Please contact jan@phage.directory.')

	} catch(e) {
    _err(e, `[api/setters] POST error — ${type}`, req.body)
		console.error(`[api/setters] POST error — ${type}`, e)
    return sendData({
      error: e.message,
    }, res, 400);
	}
}

