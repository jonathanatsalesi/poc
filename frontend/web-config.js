const cfg = require("./auth_config.json");
const config = () => {
  if (!cfg.domain
    || !cfg.authorizationParams.audience
    || !cfg.mgt
  ) {
    throw "Please make sure that auth_config.json is in place and populated";
  }
  return cfg
}
config()
module.exports = cfg