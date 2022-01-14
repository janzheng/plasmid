

// /* 

//   Uses Supabase to track events and messages as "trails"

//   - https://github.com/Logflare/next-pino-logflare-logging-example/blob/main/logger/logger.js 
//   - both server and browser
//   - make sure to also add pino-pretty as a --dev dependency!

//   */


// import { createClient } from '@supabase/supabase-js';

// // replaced by rollup
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );



// // send msg
// // schema: content (body), author (author slug for ID)
// // stores data as jsonb
// export const trail = async (message, data) => {

//   if(process.env.PROJECT_ID)
//     message = `[${process.env.PROJECT_ID}]:${message}`

//   try {
//     let { body } = await supabase
//       .from('pdn-trails')
//       .insert([{
//         message, data
//       }])
//     return body
//   } catch(e) {
//     console.error('Trail failed:', e, message, data)
//   }
// }