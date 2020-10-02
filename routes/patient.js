'use strict'

import Router from 'koa-router'
import bcrypt, { genSalt, hash } from 'bcryptjs'
import passport from 'koa-passport'
import sgMail from '@sendgrid/mail'

import {
  createUser,
  getUser,
  updateUser
} from '../db/queries/user'

const router = new Router({ prefix: '/patients' })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

router.post('/', async ctx => {
  try {
    const {
      email,
      password,
      patient_info: patientInfo
    } = ctx.request.body
    const salt = await genSalt()
    const hashed = await hash(password, salt)
    await createUser({
      type: 'patient',
      email,
      password: hashed,
      patient_info: patientInfo
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
    if (err) {
      console.log(`Error login user on /router/patients/login, ${err}`)
      ctx.status = 500
      ctx.body = {
        error: {
          message: err.message
        }
      }
    }
    if (!err) {
      ctx.status = 200
      ctx.body = {}
      return ctx.login(user)
    }
  })(ctx, next)
})

router.get('/logout', async ctx => {
  ctx.logout()
  ctx.status = 200
})

router.post('/reset-pass', async ctx => {
  try {
    const {
      email
    } = ctx.request.body
    const user = await getUser({
      email
    })
    if (!user) {
      ctx.status = 404
      ctx.body = {
        message: 'User not found'
      }
      return
    }
    const url = `http://hampi-salud.com/reset-pass?id=${user._id}`
    const msg = {
      to: email,
      from: 'admin@hampi-salud.com',
      subject: 'Reset password request',
      text: `Reset your password in the following link ${url}`
    }
    sgMail.send(msg)
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to reset pass on /router/patients/reset-pass, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to reset pass'
      }
    }
  }
})

router.put('/reset-pass', async ctx => {
  const {
    id,
    password
  } = ctx.request.body
  try {
    const salt = await genSalt()
    const hashed = await hash(password, salt)
    await updateUser({
      _id: id
    }, {
      password: hashed
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to reset pass on /router/patients/reset-pass, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to reset pass'
      }
    }
  }
  ctx.status = 200
})

router.put('/', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to edit this profile'
      }
      return
    }
    const info = ctx.request.body
    const update = {}
    Object.keys(info).map(key => {
      update[`patient_info.${key}`] = info[key]
    })
    const user = await updateUser({
      _id: ctx.state.user._id
    }, {
      $set: {
        ...update
      }
    }, {
      returnOriginal: false
    })
    ctx.status = 200
    ctx.body = user
  } catch (e) {
    console.log(`Error trying to edit information on /router/patients/, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit information'
      }
    }
  }
})

router.get('/me', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this profile'
      }
      return
    }
    const user = await getUser({
      _id: ctx.state.user._id
    })
    ctx.status = 200
    ctx.body = user
  } catch (e) {
    console.log(`Error trying to retrieve information on /router/patients/, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to retrieve information'
      }
    }
  }
})

router.post('/change-pass', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this profile'
      }
      return
    }
    const {
      old_password: oldPassword,
      new_password: newPassword
    } = ctx.request.body
    const user = await getUser({
      _id: ctx.state.user._id
    })
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      ctx.status = 401
      ctx.body = {
        message: 'Incorrect Password'
      }
      return
    }
    const salt = await genSalt()
    const hashed = await hash(newPassword, salt)
    await updateUser({
      _id: ctx.state.user._id
    }, {
      password: hashed
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to change password on /router/patients/, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to change password'
      }
    }
  }
})

export default router
