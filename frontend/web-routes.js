const express = require("express");
const {checkJwt, checkUid, checkTid} = require('./web-auth')
const { externalGet, tenantGet, tenantPut, subjectGet, subjectPut } = require("./web-endpoint")

const externalRoute = express.Router()
  .use(checkUid, checkTid)
  .get("/", externalGet);

const tenantRoute = express.Router()
  .get("/", tenantGet)
  .put("/", tenantPut);


const subjectRoute = express.Router()
  .use(checkTid)
  .get("/", subjectGet)
  .put("/", subjectPut);

const api = express.Router()
api.use(checkJwt)
api.use('/external', externalRoute)
api.use('/tenant', tenantRoute)
api.use('/subject', subjectRoute);


module.exports = {
  api
}