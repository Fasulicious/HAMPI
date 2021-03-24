'use strict'

import Router from 'koa-router'
import passport from 'koa-passport'

import {
  isAuth,
  isAdmin
} from '../middlewares/auth'

const router = new Router({ prefix: '/admin' })

router.post('/login', async (ctx, next) => {
  return passport.authenticate('local', async (err, user) => {
    if (err) {
      console.log(`Error login user on /admin/login, ${err}`)
      ctx.status = 500
      ctx.body = {
        error: {
          message: err.message
        }
      }
      return
    }
    if (user.type !== 'admin') {
      ctx.status = 401
      ctx.body = {
        error: {
          message: 'You have no access'
        }
      }
    }
    ctx.status = 200
    return ctx.login(user)
  })(ctx, next)
})

router.get('/logout', isAuth, isAdmin, async ctx => {
  try {
    ctx.logout()
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to log out on /admin/logout, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to log out'
      }
    }
  }
})

export default router
