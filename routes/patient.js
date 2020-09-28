'use strict'

import Router from 'koa-router'
import { genSalt, hash } from 'bcryptjs'
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
/*
router.get('/test', async ctx => {
  const res = ctx.isAuthenticated()
  console.log({ res })
  console.log(process.env.SENDGRID_API_KEY)
  const msg = {
    to: 'fantoniosoto@gmail.com',
    from: 'test@hampi-salud.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };
  sgMail.send(msg);
  ctx.status = 200
})

router.get('/out', async ctx => {
  ctx.logout()
  ctx.status = 200
})
*/
export default router
