const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { auth, claimCheck } = require("express-oauth2-jwt-bearer");
const { join } = require("path");
const authConfig = require("./auth_config.json");
const { argv } = require("process");
var ManagementClient = require('auth0').ManagementClient;

const app = express();

if (!authConfig.domain
  || !authConfig.authorizationParams.audience
  || !authConfig.mgt.clientId
  || !authConfig.mgt.clientSecret
  || !authConfig.mgt.aud

) {
  throw "Please make sure that auth_config.json is in place and populated";
}

app.use(morgan("dev"));
app.use(cors());
app.use(express.static(join(__dirname, "dist")));
app.use(express.json());

let mgtopts = {
  clientId: authConfig.mgt.clientId,
  clientSecret: authConfig.mgt.clientSecret,
  domain: authConfig.domain,
  scope: "read:users update:users",
  audience: authConfig.mgt.aud,
  tokenProvider: {
    enableCache: true,
    cacheTTLInSeconds: 10
  }
}
console.log(mgtopts)
var management = new ManagementClient(mgtopts);
const audience = authConfig.authorizationParams.audience
const issuerBaseURL = `https://${authConfig.domain}`
const checkJwt = auth({ audience, issuerBaseURL });

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    uid: req.auth.payload.uid,
    euid: req.auth.payload.euid,
    tenant: req.auth.payload.tenant,
    msg: "Your access token was successfully validated!"
  });
});

app.get("/api/tenant", checkJwt, (req, res) => {
  res.send(t);
});

const u = {

}

const t = {
  "NAPA": "63967af8-4f24-4f43-af25-5ec39182de1d",
  "ZARG": "ba7d9dd1-38b3-40ec-9711-0de6c81efaaf",
  "MANN": "d21cca30-5850-4afd-b299-8a5cf37d0f34"
}

const S = [
  ["63967af8-4f24-4f43-af25-5ec39182de1d", "4fd1464b-bb91-4f68-9066-655af1e7471d", "Judge Fredd", "freddy@foo.bar"],
  ["ba7d9dd1-38b3-40ec-9711-0de6c81efaaf", "f3964646-89ed-4da6-bc92-625742424d37", "Snake Pliksin", "snake@acme.co"]
]

app.put("/api/tenant", checkJwt, async (req, res) => {
  let tenant = req.body.tenant_id
  const metadata = {}
  metadata[`${authConfig.tenant}/claims/tenant`] = tenant
  metadata[`${authConfig.tenant}/claims/uid`] = '98a2f993-7de2-43ab-99ea-cb06f69291a9'
  metadata[`${authConfig.tenant}/claims/${tenant}/schema_pre`] = 'FooBar'
  try {
    await management.updateAppMetadata({ id: req.auth.payload.id }, metadata)
    res.send({
      msg: "Your access token was successfully validated!"
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({error})
  }
});

app.get("/api/subject", checkJwt, claimCheck((p)=>!!p.tenant), async (req, res) => {
  let s = []
  for(const [tenant_id , id, name, email] of S) {
    if (tenant_id===req.auth.payload.tenant) {
      s.push({id, name, email})
    }
  }
  res.send(s);
});

app.put("/api/subject", checkJwt, claimCheck((p)=>!!p.tenant), async (req, res) => {
  const metadata = {}
  metadata[`${authConfig.tenant}/claims/${req.auth.payload.tenant}/euid`] = req.body.id
  try {
    await management.updateAppMetadata({ id: req.auth.payload.id }, metadata);
    res.send({
      msg: "Your access token was successfully validated!"
    });
  } catch (error) {
    res.status(400).send({error})
  }
});

if (process.env.NODE_ENV === "production") {
  app.use((_, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}
const port = process.env.NODE_ENV === "production" ? 3000 : 3001;
app.listen(port, () => console.log(`Server listening on port ${port}`));