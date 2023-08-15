const config = require('./web-config')
const { manageapi } = require('./web-auth')

const mgtclient = manageapi()

// Array elements map to: [TenantID, UserID, Name, Email]
const S = [
  ["63967af8-4f24-4f43-af25-5ec39182de1d", "4fd1464b-bb91-4f68-9066-655af1e7471d", "Judge Fredd", "freddy@foo.bar"],
  ["ba7d9dd1-38b3-40ec-9711-0de6c81efaaf", "f3964646-89ed-4da6-bc92-625742424d37", "Snake Pliksin", "snake@acme.co"]
]


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
  metadata[`${config.tenant}/claims/tenant`] = tenant
  metadata[`${config.tenant}/claims/${tenant}/schema_pre`] = 'FooBar'
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
  metadata[`${config.tenant}/claims/${req.auth.payload.tenant}/euid`] = req.body.id
  try {
    await mgtclient.updateAppMetadata({ id: req.auth.payload.id }, metadata);
    res.send({
      msg: "Your access token was successfully validated!"
    });
  } catch (error) {
    res.status(400).send({ error })
  }
}

const externalGet = (req, res) => {
  res.send({
    uid: req.auth.payload.uid,
    euid: req.auth.payload.euid,
    tenant: req.auth.payload.tenant,
    msg: "Your access token was successfully validated!"
  });
};

module.exports = {
  subjectGet, subjectPut, tenantGet, tenantPut, externalGet
}