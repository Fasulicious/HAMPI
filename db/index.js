'use strict'

import mongoose from 'mongoose'

const {
  DB_USER,
  DB_PASSWORD,
  DB_DOMAIN,
  DB_NAME
} = process.env

export default () => mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_DOMAIN}/${DB_NAME}?retryWrites=true&w=majority`, {
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
