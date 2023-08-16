const cfg = require('./web-config')
const { auth, claimCheck } = require('express-oauth2-jwt-bearer')
const { ManagementClient } = require('auth0')

const manageapi = () => {
  if (!cfg
    || !cfg.domain
    || !cfg.mgt.clientId
    || !cfg.mgt.clientSecret
    || !cfg.mgt) {
    throw "Please make sure that auth_config.json is in place and populated";
  }
  let opts = {
    clientId: cfg.mgt.clientId,
    clientSecret: cfg.mgt.clientSecret,
    domain: cfg.domain,
    scope: "read:users update:users",
    audience: cfg.mgt.aud,
    tokenProvider: {
      enableCache: true,
      cacheTTLInSeconds: 10
    }
  }
  return new ManagementClient(opts);
}

const audience = cfg.authorizationParams.audience
const issuerBaseURL = `https://${cfg.domain}`

const checkJwt = auth({ audience, issuerBaseURL });
const hasTenant = (jwt) => !!jwt.tenant
const checkTid = claimCheck(hasTenant, "undefined tenant")
const hasUid = (jwt) => !!jwt.uid
const checkUid = claimCheck(hasUid, "undefined uid")

module.exports = {
  manageapi, checkJwt, checkTid, checkUid
}