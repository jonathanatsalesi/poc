const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { auth, claimCheck } = require("express-oauth2-jwt-bearer");
const { join } = require("path");
const auth = require('./auth')

const mgtclient = auth.manageapi()
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.static(join(__dirname, "dist")));
app.use(express.json());

const audience = authConfig.authorizationParams.audience
const issuerBaseURL = `https://${authConfig.domain}`
const checkJwt = auth({ audience, issuerBaseURL });
const checkTid = claimCheck((jwt) => !!jwt.tenant)
const checkUid = claimCheck((jwt) => !!jwt.uid, "undefined uid")

const externalGet = (req, res) => {
  res.send({
    uid: req.auth.payload.uid,
    euid: req.auth.payload.euid,
    tenant: req.auth.payload.tenant,
    msg: "Your access token was successfully validated!"
  });
};
const externalRoute = express.Router()
  .use(checkUid, checkTid)
  .get("/", externalGet);

// Properties are Tenants
const T = {
  "FOOO": "63967af8-4f24-4f43-af25-5ec39182de1d",
  "ZARG": "ba7d9dd1-38b3-40ec-9711-0de6c81efaaf",
  "BAAR": "d21cca30-5850-4afd-b299-8a5cf37d0f34"
}

const tenantGet = (_, res) => {
  res.send(T);
};
const tenantPut = async (req, res) => {
  let tenant = req.body.tenant_id
  const metadata = {}
  metadata[`${authConfig.tenant}/claims/tenant`] = tenant
  metadata[`${authConfig.tenant}/claims/${tenant}/schema_pre`] = 'FooBar'
  try {
    await mgtclient.updateAppMetadata({ id: req.auth.payload.id }, metadata)
    res.send({
      msg: "Your access token was successfully validated!"
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({ error })
  }
};
const tenantRoute = express.Router()
  .get("/", tenantGet)
  .put("/", tenantPut);

// Array elements map to: [TenantID, UserID, Name, Email]
const S = [
  ["63967af8-4f24-4f43-af25-5ec39182de1d", "4fd1464b-bb91-4f68-9066-655af1e7471d", "Judge Fredd", "freddy@foo.bar"],
  ["ba7d9dd1-38b3-40ec-9711-0de6c81efaaf", "f3964646-89ed-4da6-bc92-625742424d37", "Snake Pliksin", "snake@acme.co"]
]

const subjectGet = async (req, res) => {
  let s = []
  for (const [tenant_id, id, name, email] of S) {
    if (tenant_id === req.auth.payload.tenant) {
      s.push({ id, name, email })
    }
  }
  res.send(s);
}
const subjectPut = async (req, res) => {
  const metadata = {}
  metadata[`${authConfig.tenant}/claims/${req.auth.payload.tenant}/euid`] = req.body.id
  try {
    await mgtclient.updateAppMetadata({ id: req.auth.payload.id }, metadata);
    res.send({
      msg: "Your access token was successfully validated!"
    });
  } catch (error) {
    res.status(400).send({ error })
  }
}
const subjectRoute = express.Router()
  .use(checkTid)
  .get("/", subjectGet)
  .put("/", subjectPut);

const api = express.Router()
api.use(checkJwt)
api.use('/external', externalRoute)
api.use('/tenant', tenantRoute)
api.use('/subject', subjectRoute);
app.use('/api', api)

if (process.env.NODE_ENV === "production") {
  app.use((_, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}
const port = process.env.NODE_ENV === "production" ? 3000 : 3001;
app.listen(port, () => console.log(`Server listening on port ${port}`));