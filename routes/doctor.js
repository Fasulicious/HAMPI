'use strict'

import Router from 'koa-router'

const router = new Router({ prefix: '/doctor' })

router.post('/', async ctx => {
  try {
    const {
      email,
      password,
      doctor_info: doctorInfo
    } = ctx.request.body
    const salt = await genSalt()
    const hashed = await hash(password, salt)
    await createUser({
      type: 'patient',
      email,
      password: hashed,
      doctor_info: doctorInfo
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

export default router
