const { Router } = require("express");
const { checkJwt, checkUid, checkTid } = require('./web-auth')
const { externalGet, tenantGet, tenantPut, subjectGet, subjectPut } = require("./web-endpoint")

const externalRoute = Router()
  .use(checkUid, checkTid)
  .get("/", externalGet);

const tenantRoute = Router()
  .get("/", tenantGet)
  .put("/", tenantPut);


const subjectRoute = Router()
  .use(checkTid)
  .get("/", subjectGet)
  .put("/", subjectPut);

const api = Router()
api.use(checkJwt)
api.use('/external', externalRoute)
api.use('/tenant', tenantRoute)
api.use('/subject', subjectRoute);


module.exports = {
  api
}