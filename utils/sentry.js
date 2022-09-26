/*

setup for sentry error tracking
https://docs.sentry.io/platforms/node/

last updated: 11/17/2020

this will NOT work in conjunction with sentry-browser
for some odd reason, you can either only do server or client-side lol

*/


/* 
  Sentry.captureMessage("Something went wrong");
*/
// if this fails, try to install @sentry/node --dev locally in the project
import * as Sentry from '@sentry/node';
// import * as Sentry from '@sentry/serverless';
// import * as Tracing from '@sentry/tracing';

const sentryUrl = process.env.SENTRY
Sentry.init({
  dsn: sentryUrl,
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

export let _sentry = Sentry


// create setup and create a transaction
// make sure to close it at the end of scope w/ transaction.finish()
export const _tr = (op,name) => {
  if(Sentry) {
    return Sentry.startTransaction({
      op, name
    });
  }
  return undefined
}

// capture a simple error
// note: err is the thrown exception object!!
// https://github.com/getsentry/sentry-javascript/issues/1607
// export const _err = (err, loud=false) => {
//   if(loud){console.error('[sentry/_err] sending error:', err)}
//   Sentry.captureException(err)
// }
export const _err = (err, msg, data) => {
  if(Sentry) {
    Sentry.captureException(err, scope => {
      if (msg)
        scope.addBreadcrumb({
          type: "error", // predefined types
          category: "error",
          level: Sentry.Severity.Error,
          message: msg
        });
      if (data)
        scope.setContext("data", data);
    });
  }
}

// capture a message
export const _msg = (msg,loud=false) => {
  if(Sentry) {
    if(loud){console.log('[sentry/_msg] messaging:', msg)}
    Sentry.captureMessage(msg)
  }
}



export const _test = () => {

  const transaction = Sentry.startTransaction({
    op: "test",
    name: "My First Test Transaction",
  });

  setTimeout(() => {
    try {
      foo();
    } catch (e) {
      console.log('[Testing Sentry]', Sentry)
      Sentry.captureException(e);
    } finally {
      transaction.finish();
    }
  }, 99);

  try {
    // ...
  } catch (e) {
    Sentry.captureException(e);
  }
}




// https://docs.sentry.io/platforms/node/performance/
// useful for tracking api calls