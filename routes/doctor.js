'use strict'

import Router from 'koa-router'
import bcrypt, { genSalt, hash } from 'bcryptjs'

import {
  createUser,
  getUser,
  updateUser
} from '../db/queries/user'

import {
  getAppointments
} from '../db/queries/appointment'

const router = new Router({ prefix: '/doctor' })

// Create
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
    console.log(`Error creating user on /router/doctor, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error creating user'
      }
    }
  }
})

// Edit profile
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
      update[`doctor_info.${key}`] = info[key]
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
    console.log(`Error trying to edit information on /router/doctor/, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit information'
      }
    }
  }
})

// Get profile
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

// Reset Password in profile
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
    console.log(`Error trying to change password on /router/doctor/change-pass, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to change password'
      }
    }
  }
})

// Get Payments
router.get('/payment', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this profile'
      }
      return
    }
    const payments = await getUser({
      _id: ctx.state.user._id
    }, 'payments')
    ctx.status = 200
    ctx.body = payments
  } catch (e) {
    console.log(`Error trying to get payments on /router/patients/payment, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get payments'
      }
    }
  }
})

// Get appointments
router.get('/appointment', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see these appointments'
      }
      return
    }
    const appointments = await getAppointments({
      doctor: ctx.state.user._id
    })
    const appointmentHistory = []
    // const upcomingAppointments = []
    const now = new Date()
    appointments.map(appointment => {
      if (appointment.date < now) appointmentHistory.push({ ...appointment })
    })
    ctx.status = 200
    ctx.body = appointmentHistory
  } catch (e) {
    console.log(`Error trying to get appointments on /router/doctor/appointment, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get appointments'
      }
    }
  }
})

// Create Recipe
router.post('/recipe', async ctx => {

})

// Get patient
router.get('/patient/:id', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this patient'
      }
      return
    }
    const { id } = ctx.params
    const patient = await getUser({
      _id: id
    })
    ctx.status = 200
    ctx.body = patient
  } catch (e) {
    console.log(`Error trying to get doctor on /router/doctor/patient, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get patient'
      }
    }
  }
})

export default router
