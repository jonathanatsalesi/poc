# Auth0 Claims POC

For this scenario, an API endpoint `/api/external` has been included in the Express server that requires a bearer token to be supplied as a bearer token in the `Authorization` header (as provided during the authentication flow). This uses the [`express-oauth2-jwt-bearer`](https://github.com/auth0/node-oauth2-jwt-bearer) middleware to validate the token against the identifier of your API as set up in the Auth0 dashboard, as well as checking that the signature is valid.

### Summary

1. **Initialization**: 
   Imports required modules like Express, morgan (for logging), cors (for handling Cross-Origin Resource Sharing), OAuth2 authentication, and the Auth0 management client.

2. **Configuration**:
   Reads authentication configuration from a JSON file and throws an error if necessary details are missing.

3. **Middleware Setup**:
   Adds Logging, CORS, and JSON parsing middleware to the application.

4. **Auth0 Management Client**:
   Creates a management client for Auth0 to allow the updating of application metadata.

5. **JWT Authentication**:
   Sets up middleware for JWT authentication.

6. **API Endpoints**:
   Defines several API endpoints.

7. **Production Handling**:
   If in a production environment, sets up a handler to serve the frontend files.

8. **Server Startup**:
   Application starts listening on a specified port.

### API Endpoints

- **GET /api/external**: Validates the user's access token and returns various token payload data.
   - **Purpose**: Confirm the user's authentication and send back information contained in the token.
   - **Output**: User ID, extended user ID, tenant, and a success message.

- **GET /api/tenant**: Returns a predefined object containing tenant details.
   - **Purpose**: Provide client applications with details about available tenants.
   - **Output**: A predefined object containing tenant identifiers.

- **PUT /api/tenant**: Allows updating tenant-related metadata in Auth0 using the provided tenant ID.
   - **Purpose**: Allow authenticated users to modify their tenant-related metadata.
   - **Output**: A success message, or a 400 status code and error message in case of failure.

- **GET /api/subject**: Based on authenticated user's tenant ID, returns a filtered list of subjects. Claim check is performed to ensure the user has a valid tenant.
   - **Purpose**: Retrieve subjects related to the authenticated user's tenant.
   - **Output**: An array of subject objects.

- **PUT /api/subject**: Allows updating subject-related metadata in Auth0 for the authenticated user. Claim check is performed to ensure the user has a valid tenant.
   - **Purpose**: Allow authenticated users to modify their subject-related metadata.
   - **Output**: A success message, or a 400 status code and error message in case of failure.

This code is a example of a backend system that can interact with Auth0 Management API to set user claims for authorization post login.

### Function: `onExecutePostLogin`

```JavaScript
/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  //api.accessToken.setCustomClaim("id", event.user.user_id)
  const uid = event.user.app_metadata[`${event.tenant.id}/claims/uid`]
  api.accessToken.setCustomClaim("uid", uid)
  api.idToken.setCustomClaim("uid", uid)
  let tenant = event.user.app_metadata[`${event.tenant.id}/claims/tenant`]
  api.accessToken.setCustomClaim("tenant", tenant)
  api.idToken.setCustomClaim("tenant", tenant)
  // access_token email claim
  api.accessToken.setCustomClaim("email", event.user.email)
  // tenant scoped claims
  if (!!tenant) {
    const euid = event.user.app_metadata[`${event.tenant.id}/claims/${tenant}/euid`]
    api.accessToken.setCustomClaim("euid", euid)
    api.idToken.setCustomClaim("euid", euid)
    let scm = `${event.tenant.id}/claims/${tenant}/schema_pre`  
    api.accessToken.setCustomClaim("schema_pre", event.user.app_metadata[scm])
  }
};

```

#### Purpose:

This function is part of an Auth0 Rule and is triggered post-login. It's designed to set custom claims on the user's access token based on information contained in the user's app metadata. Specifically, it checks for keys scoped to the current tenant, which indicates a multi-tenant architecture.

#### Details:

1. **General Claims**:
   - **`id`**: The user's ID.
   - **`uid`**: A custom user identifier, retrieved from the user's app metadata.
   - **`tenant`**: A tenant identifier, also retrieved from the user's app metadata.

2. **Tenant-Scoped Claims**:
   If a tenant is identified in the user's app metadata:
   - **`euid`**: An extended user identifier specific to the tenant.
   - **`schema_pre`**: A schema prefix specific to the tenant (e.g., used to distinguish different data structures within a multi-tenant system).

#### How It Works:

- It first sets the general claims for every user, using information available in the `event.user` object.
- Then, it checks for a tenant in the user's app metadata.
- If a tenant is found, it looks for keys scoped to that tenant within the app metadata and adds tenant-scoped claims accordingly.

#### Integration with Express Backend:

This function works in conjunction with the previously mentioned Express backend. When a user logs in, this function customizes the access token with information specific to the user's tenant. The Express backend can then use this token to provide a personalized experience based on the tenant and other claims embedded within the token.

#### Use Case:

This functionality is useful in a multi-tenant system, where different users belong to different tenants and may have different permissions or access to different data based on their tenant membership.


### TODO

- Relinquish the impersonation claim.


## Project setup

```bash
npm install
```

### Configuration

The project needs to be configured with your Auth0 domain and client ID in order for the authentication flow to work. When calling an external API, ensure to also set the `audience` to the value of your Auth0 API identifier.

To do this, first copy `auth_config.sample.json` into a new file in the same folder called `auth_config.json`, and replace the values within with your own Auth0 application credentials:

```json
{
  "tenant": "{AUTH0_TENANT_ID},
  "domain": "{AUTH0_TENANT_DOMAIN}",
  "clientId": "{AUTH0_TENANT_CLIENT_ID}",
  "authorizationParams": {
    "audience": "{API_IDENTIFIER}"
  },
  "mgt": {
    "aud":"{AUTH0_MANAGEMENT_API_IDENTIFIER}",
    "clientId":"{AUTH0_MANAGEMENT_API_CLIENT_ID}",
    "clientSecret":"{AUTH0_MANAGEMENT_API_CLIENT_SECRET}",
  }
}
```

### Running in development

This compiles and serves the Vue app:

```bash
npm run serve
```

This runs the backend api:

```bash
node web-server.js
```

## Deployment

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

## What is Auth0?

Auth0 helps you to:

- Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, among others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
- Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
- Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
- Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
- Analytics of how, when and where users are logging in.
- Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a Free Auth0 Account

1.  Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2.  Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](../LICENSE) file for more info.
