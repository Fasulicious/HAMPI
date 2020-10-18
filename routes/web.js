'use strict'

import Router from 'koa-router'

import User from '../db/models/user'

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

router.get('/find/:specialty', async ctx => {
  const {
    specialty
  } = ctx.params
  const doctors = await User.aggregate([
    {
      $match: {
        'doctor_info.specialty': specialty,
        'doctor_info.active': true
      }
    },
    {
      $lookup:
        {
          from: 'appointments',
          localField: 'doctor_info.appointments',
          foreignField: '_id',
          as: 'appointments'
        }
    },
    {
      $addFields: {
        rating: {
          $size: {
            $filter: {
              input: '$appointments',
              as: 'apps',
              cond: { $eq: ['$$apps.qualification', 'Like'] }
            }
          }
        }
      }
    },
    {
      $project: {
        avatar: '$doctor_info.avatar',
        name: '$doctor_info.name',
        last_name: '$doctor_info.last_name',
        specialty: '$doctor_info.specialty',
        experience: '$doctor_info.experience',
        introduction: '$doctor_info.introduction',
        rating: '$rating'
      }
    }
  ])
  ctx.status = 200
  ctx.body = doctors
})

export default router
