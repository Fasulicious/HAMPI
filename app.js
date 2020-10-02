'use strict'

import Koa from 'koa'
import logger from 'koa-logger'
import helmet from 'koa-helmet'
import cors from 'koa2-cors'
import body from 'koa-body'
import compress from 'koa-compress'
import session from 'koa-session'
import redisStore from 'koa-redis'
import passport from 'koa-passport'

import configPassport from './config/passport'

import patient from './routes/patient'
import web from './routes/web'

const app = new Koa()

app.keys = ['hampi']

const config = {
  key: 'hampi',
  maxAge: 24 * 60 * 60 * 1000,
  autoCommit: true,
  overwrite: true,
  signed: true,
  httpOnly: true,
  rolling: true,
  renew: false,
  store: redisStore()
}

configPassport(passport)

app.use(cors())
app.use(body())
app.use(logger())
app.use(helmet())
app.use(compress())
app.use(session(config, app))
app.use(passport.initialize())
app.use(passport.session())

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    console.log(e)
    ctx.status = 500
    ctx.body = {
      error: {
        body: 'unhandled error',
        message: 'Something went wrong'
      }
    }
  }
})

app.use(patient.routes())

app.use(web.routes())

export default app
