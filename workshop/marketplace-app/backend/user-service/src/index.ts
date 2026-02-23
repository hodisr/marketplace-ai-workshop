import { app } from './app.js'
import { initDb } from './database.js'
import { PORT } from './config.js'

async function main() {
  await initDb()
  app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`)
  })
}

main().catch(console.error)
