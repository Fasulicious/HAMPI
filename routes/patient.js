'use strict'

import Router from 'koa-router'
import { genSalt, hash } from 'bcryptjs'
import passport from 'koa-passport'

import {
  createUser
} from '../db/queries/user'

const router = new Router({ prefix: '/patients' })

router.post('/', async ctx => {
  try {
    const {
      name,
      last_name: lastName,
      email,
      password,
      DNI,
      phone_number: phoneNumber
    } = ctx.request.body
    const salt = await genSalt()
    const hashed = await hash(password, salt)
    await createUser({
      type: 'patient',
      email,
      password: hashed,
      patient_info: {
        name,
        last_name: lastName,
        DNI,
        phone_number: phoneNumber
      }
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error creating user on /router/patients, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error creating user'
      }
    }
  }
})

router.post('/login', async (ctx, next) => {
  return passport.authenticate('local', (err, user) => {
    if (err) console.log(err)
    if (!err) {
      ctx.status = 200
      ctx.body = {}
      return ctx.login(user)
    }
  })(ctx, next)
})

router.get('/test', async ctx => {
  const res = ctx.isAuthenticated()
  console.log({ res })
  ctx.status = 200
})

router.get('/out', async ctx => {
  ctx.logout()
  ctx.status = 200
})

export default router
