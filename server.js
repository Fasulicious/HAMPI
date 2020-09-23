'use strict'

import app from './app'
import db from './db'

const { PORT } = process.env

const server = async () => {
  await db()
  console.log('MongoDB connected')
  await app.listen(PORT || 3000)
  console.log(`Server listening on port ${PORT || 3000}`)
}

server()
