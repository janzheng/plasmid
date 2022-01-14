/*var util = require('util')
var OAuth2Strategy = require('passport-oauth2')

// DOESN'T WORK — Protocolsio doesn't support localhost

  
/**
 * First, register a Protocols.io API client:
 * https://www.protocols.io/developers
 *
 * Protocols.io docs: https://apidoc.protocols.io/
 * Protocols doesn't play nice with localhost callbacks...
 *
 * Authorization URL: https://www.protocols.io/api/v3/oauth/authorize?client_id=[your_client_id]&redirect_url=[your_redirect_url]&response_type=code&scope=readwrite&state=[your_state]
 *
 *
 * Options:
 *   - `sandbox`       whether to use the ORCID sandbox API (for non-production environments)
 *   - `clientID`      your ORCID application's client id
 *   - `clientSecret`  your ORCID application's client secret
 *   - `callbackURL`   URL to which ORCID will redirect the user after granting authorization
 *
 * Example:
 *
 *     passport.use(new OrcidStrategy({
 *         state: true, // remove this if not using sessions,
 *         clientID: process.env.PROTOCOLSIO_CLIENT_ID,
 *         clientSecret: process.env.PROTOCOLSIO_CLIENT_SECRET,
 *         callbackURL: 'https://your.host/auth/protocolsio/callback',
 *       },
 *       function(accessToken, refreshToken, params, profile, done) {
 *         // NOTE: `profile` is empty, but `params` contains `orcid` and `name`
 *         profile = { orcid: params.orcid, name: params.name }
 *
 *         User.findOrCreate(profile, function (err, user) {
 *           done(err, user)
 *         })
 *       }
 *     ))
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 *
function Strategy (options, verify) {
  const scope = options._scope || 'readwrite'
  const state = options._state || true

  options.authorizationURL = `https://www.protocols.io/api/v3/oauth/authorize?client_id=${options.clientID}&redirect_url=${options.callbackURL}&response_type=code&scope=${scope}&state=${options.state}`
  options.tokenURL = 'https://www.protocols.io/api/v3/oauth/token'


  // console.log('Proto options', options)

  OAuth2Strategy.call(this, options, verify)
  this.name = 'protocolsio'
}

util.inherits(Strategy, OAuth2Strategy)

module.exports = Strategy


// https://www.protocols.io/api/v3/oauth/authorize?client_id=pr_live_id_56863113bd83361fb3e52d073501d4c4&redirect_url=http://localhost:3000/auth/protocolsio-callback&response_type=code&scope=readwrite&state=true

// https://www.protocols.io/api/v3/oauth/authorize?client_id=pr_live_id_56863113bd83361fb3e52d073501d4c4&redirect_url=http://localhost:3000/auth/protocolsio-callback&response_type=code&scope=readwrite&state=true

// https://www.protocols.io/api/v3/oauth/authorize?client_id=[your_client_id]&redirect_url=[your_redirect_url]&response_type=code&scope=readwrite&state=[your_state]

*/

