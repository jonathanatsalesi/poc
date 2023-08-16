 const auth = require('./auth')

 async function main() {
  await auth.manageapi().createUser({
    connection: "Username-Password-Authentication",
    email: "foo@bara.com",
    name: "mr chubbs",
    password: "",
    user_id: "7982-3489-7234-1978",
  })
 }

 main()