var ManagementClient = require('auth0').ManagementClient;

const config = () => {
  const cfg = require("./auth_config.json");
  if (!cfg.domain
    || !cfg.authorizationParams.audience
    || !cfg.mgt
  ) {
    throw "Please make sure that auth_config.json is in place and populated";
  }
  return cfg
}

const manageapi = (cfg) => {
  cfg = cfg || config()
  if ( !cfg
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

module.exports = {
  config, manageapi
}