'use strict'

import Router from 'koa-router'
import passport from 'koa-passport'

import {
  isAuth,
  isAdmin
} from '../middlewares/auth'

import {
  getUsers,
  updateUser
} from '../db/queries/user'

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
/*
router.post('/medication', isAuth, isAdmin, async ctx => {
  try {

  } catch (e) {
    console.log(`Error trying to create medication on /admin/medication, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to create medication'
      }
    }
  }
})
*/
router.get('/doctor', isAuth, isAdmin, async ctx => {
  try {
    const doctors = await getUsers({
      type: 'doctor'
    }, {
      email: 1,
      doctor_info: 1
    })
    ctx.status = 200
    ctx.body = doctors
  } catch (e) {
    console.log(`Error trying to get doctors on /admin/doctor, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get doctor info'
      }
    }
  }
})

router.put('/doctor/:id', isAuth, isAdmin, async ctx => {
  try {
    const { id } = ctx.params
    const { email } = ctx.request.body
    await updateUser({
      _id: id
    }, {
      email
    }, {
      returnOriginal: false
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to edit doctor info on /admin/doctor, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit doctor info'
      }
    }
  }
})

router.get('/patient', isAuth, isAdmin, async ctx => {
  try {
    const patients = await getUsers({
      type: 'patient'
    }, {
      email: 1,
      patient_info: 1
    })
    ctx.status = 200
    ctx.body = patients
  } catch (e) {
    console.log(`Error trying to get patients on /admin/patient, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get patient info'
      }
    }
  }
})

export default router
