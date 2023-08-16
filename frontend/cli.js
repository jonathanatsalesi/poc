const { manageapi } = require('./web-auth')
const config = require('./web-config')
const crypto = require('node:crypto')

async function main() {
  const api = manageapi()
  const args = process.argv
  console.log(args)

  try {
    switch (args[2]) {
      case "del":
        {
          const users = []
          for (let email of args.slice(3)) {
            for (let u of await api.getUsersByEmail(email)) {
              console.log(u)
              users.push({ id: u.user_id })
            }
          }
          console.log(users)
          for (let user of users) {
            await api.deleteUser(user)
          }
          break
        }
      case "add":
        {
          let email = args[3], name = args[4]
          const usr = await api.createUser({
            connection: "Username-Password-Authentication",
            email,
            name,
            password: crypto.randomBytes(32).toString('base64'),
            user_id: crypto.randomBytes(32).toString('hex'),
            verify_email: false
          })
          break
        }
      case "inv":
        {
          let email = args[3]
          const users = await api.getUsersByEmail(email)
          if (users.length == 0) {
            return
          }
          user_id = users[0].user_id
          const data = {
            user_id,
            ttl_sec: 300
          };
          const resetLink = await api.createPasswordChangeTicket(data)
          console.log(resetLink)
        }
        break
      default:
        {
          console.log(`
            commands:
              del\tremove user
              add\tadd user
              inv\tinvite user (password reset)
          `)
          break
        }
    }
  } catch (error) {
    console.log(error)
  }
}

main()