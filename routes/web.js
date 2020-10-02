'use strict'

import Router from 'koa-router'

import sgMail from '@sendgrid/mail'

const router = new Router({ prefix: '/web' })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

router.post('/contact', async ctx => {
  try {
    const {
      name,
      email,
      message
    } = ctx.request.body
    const msg = {
      to: 'hampi@gmail.com',
      from: 'admin@hampi-salud.com',
      subject: 'Somebody contact us',
      text: `Somebody tried to contact you with the following data name: ${name}, email: ${email}, message: ${message}`
    }
    await sgMail.send(msg)
    ctx.status = 200
  } catch (e) {
    console.log(e)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error sending contact message'
      }
    }
  }
})

export default router
