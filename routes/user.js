'use strict'

import Router from 'koa-router'
import { genSalt, hash } from 'bcryptjs'
import passport from 'koa-passport'

import {
  createUser
} from '../db/queries/user'

const router = new Router({ prefix: '/users' })

router.post('/', async (ctx, next) => {
  try {
    const {
      name,
      last_name,
      type,
      email,
      password,
      DNI,
      phone_number
    } = ctx.request.body
    const salt = await genSalt()
    const hashed = await hash(password, salt)
    await createUser({
      type,
      name,
      last_name,
      email,
      password: hashed,
      DNI,
      phone_number
    })
    ctx.status = 200
  } catch (e){
    console.log(`Error creating user on /router/user, ${e}`)
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

export default router
