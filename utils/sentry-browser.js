/* 7/6/2021

setup for sentry error tracking for the browser
https://docs.sentry.io/platforms/node/



*/


/* 
  const transaction = Sentry.startTransaction({
    op: "test",
    name: "My First Test Transaction",
  });

  setTimeout(() => {
    try {
      foo();
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      transaction.finish();
    }
  }, 99);

*/

/* 
  try {
    // ...
  } catch (e) {
    Sentry.captureException(e);
  }
*/

/* 
  Sentry.captureMessage("Something went wrong");
*/
import * as SentryBrowser from '@sentry/browser';
import { Integrations } from "@sentry/tracing";

const sentryUrl = process.env.SENTRY // don't forget to replace this in Rollup
SentryBrowser.init({
  dsn: sentryUrl, 
  integrations: [new Integrations.BrowserTracing()],
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

export let _sentry = SentryBrowser


// create setup and create a transaction
// make sure to close it at the end of scope w/ transaction.finish()
export const _tr = (op,name) => {
  if(SentryBrowser) {
    return SentryBrowser.startTransaction({
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
  console.log('capturing exception', err)
  return SentryBrowser.captureException(err)
  SentryBrowser.captureException(err, scope => {
    if (msg)
      scope.addBreadcrumb({
        type: "error", // predefined types
        category: "error",
        level: SentryBrowser.Severity.Error,
        message: msg
      });
    if (data)
      scope.setContext("extra-data", data);
  });
}

// capture a message
export const _msg = (msg,loud=false) => {
  if(loud){console.log('[sentry/_msg] messaging:', msg)}
  SentryBrowser.captureMessage(msg)
}





// https://docs.sentry.io/platforms/node/performance/
// useful for tracking api calls