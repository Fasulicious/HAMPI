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

import {
  getAppointment,
  getAppointments,
  updateAppointment
} from '../db/queries/appointment'

import {
  getDiagnosis
} from '../db/queries/diagnosis'

import {
  getRecipe
} from '../db/queries/recipe'

const router = new Router({ prefix: '/patient' })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Create
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

// Login
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

// Logout
router.get('/logout', async ctx => {
  ctx.logout()
  ctx.status = 200
})

// Reset Password with mail
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

// Reset Password after mail
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

// Get profiñe
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
    console.log(`Error trying to change password on /router/patients/change-pass, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to change password'
      }
    }
  }
})

// Get Appointment
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
      patient: ctx.state.user._id
    })
    const appointmentHistory = []
    const upcomingAppointments = []
    const now = new Date()
    appointments.map(appointment => {
      if (appointment.date > now) upcomingAppointments.push({ ...appointment })
      else appointmentHistory.push({ ...appointment })
    })
    ctx.status = 200
    ctx.body = {
      appointmentHistory,
      upcomingAppointments
    }
  } catch (e) {
    console.log(`Error trying to get appointments on /router/patients/appointments, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get appointments'
      }
    }
  }
})

// Get Diagnosis
router.get('/diagnosis/:id', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this diagnosis'
      }
      return
    }
    const { id } = ctx.params
    const diagnosis = await getDiagnosis({
      _id: id
    })
    if (diagnosis.patient.toString() !== ctx.state.user._id.toString()) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this diagnosis'
      }
      return
    }
    return diagnosis
  } catch (e) {
    console.log(`Error trying to get diagnosis on /router/patients/diagnosis, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get diagnosis'
      }
    }
  }
})

// Get Recipe
router.get('/recipe/:id', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this recipe'
      }
      return
    }
    const { id } = ctx.params
    const recipe = await getRecipe({
      _id: id
    })
    if (recipe.patient.toString() !== ctx.state.user._id.toString()) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this recipe'
      }
      return
    }
    return recipe
  } catch (e) {
    console.log(`Error trying to get recipe on /router/patients/recipe, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get recipe'
      }
    }
  }
})

// Get doctor
router.get('/doctor/:id', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to see this doctor'
      }
      return
    }
    const { id } = ctx.params
    const doctor = await getUser({
      _id: id
    })
    ctx.status = 200
    ctx.body = doctor
  } catch (e) {
    console.log(`Error trying to get doctor on /router/patients/doctor, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get doctor'
      }
    }
  }
})

// Rate appointment
router.put('/appointment/:id', async ctx => {
  try {
    const auth = ctx.isAuthenticated()
    if (!auth) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to rate this appointment'
      }
      return
    }
    const { id } = ctx.params
    const { qualification } = ctx.request.body
    const appointment = await getAppointment({
      _id: id
    })
    if (appointment.patient.toString() !== ctx.state.user._id.toString()) {
      ctx.status = 401
      ctx.body = {
        message: 'You have no access to rate this appointment'
      }
      return
    }
    await updateAppointment({
      _id: id
    }, {
      qualification
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying rate appointment on /router/patients/appointment, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying rate appointment'
      }
    }
  }
})

export default router
