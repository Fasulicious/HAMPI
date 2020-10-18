'use strict'

import Router from 'koa-router'
import multer from 'koa-multer'
import bcrypt, { genSalt, hash } from 'bcryptjs'

import uploadS3 from '../utils'

import Appointment from '../db/models/appointment'

import {
  isAuth
} from '../middlewares/auth'

import {
  createUser,
  getUser,
  updateUser
} from '../db/queries/user'

const router = new Router({ prefix: '/doctor' })

const upload = multer()

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
      type: 'doctor',
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
router.put('/', isAuth, upload.fields([
  {
    name: 'avatar'
  },
  {
    name: 'sign_stamp'
  }
]), async ctx => {
  try {
    const keys = Object.keys(ctx.request.files)
    for (const key of keys) {
      await uploadS3(ctx.request.files[key].path, key, ctx.state.user._id)
    }
    const info = ctx.request.body
    const update = {}
    Object.keys(info).map(key => {
      update[`doctor_info.${key}`] = info[key]
    })
    update['doctor_info.avatar'] = `https://mindtec-hampi.s3.amazonaws.com/avatar/${ctx.state.user._id}`
    update['doctor_info.sign_stamp'] = `https://mindtec-hampi.s3.amazonaws.com/sign_stamp/${ctx.state.user._id}`
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
router.get('/me', isAuth, async ctx => {
  try {
    const user = await getUser({
      _id: ctx.state.user._id
    }, {
      email: 1,
      doctor_info: 1
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
router.post('/change-pass', isAuth, async ctx => {
  try {
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
router.get('/payment', isAuth, async ctx => {
  try {
    const payments = await getUser({
      _id: ctx.state.user._id
    }, 'doctor_info.payments')
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

// Get todays appointments
router.get('/appointment/:timestamp', isAuth, async ctx => {
  try {
    const { timestamp } = ctx.params
    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctor: ctx.state.user._id
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patient',
          foreignField: '_id',
          as: 'patient'
        }
      },
      {
        $unwind: '$patient'
      },
      {
        $project: {
          patient: {
            $concat: ['$patient.patient_info.name', ' ', '$patient.patient_info.last_name']
          },
          date: '$date'
        }
      }
    ])
    const today = new Date(timestamp)
    const tomorrow = new Date(timestamp + 24 * 60 * 60 * 1000)
    const todayAppoinments = appointments.filter(appointment => appointment.date > today && appointment.date < tomorrow)
    ctx.status = 200
    ctx.body = todayAppoinments
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

// Get appointments history
router.get('/appointment/history', isAuth, async ctx => {
  try {
    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctor: ctx.state.user._id
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patient',
          foreignField: '_id',
          as: 'patient'
        }
      },
      {
        $unwind: '$patient'
      },
      {
        $project: {
          patient: {
            $concat: ['$patient.patient_info.name', ' ', '$patient.patient_info.last_name']
          },
          date: '$date',
          qualification: '$qualification',
          cost: '$cost',
          diagnosis: '$diagnosis',
          recipe: '$recipe'
        }
      }
    ])
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const appointmentHistory = appointments.filter(appointment => appointment.date < today)
    ctx.status = 200
    ctx.body = appointmentHistory
  } catch (e) {
    console.log(`Error trying to get appointments on /router/doctor/appointment/history, ${e}`)
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
router.get('/patient/:id', isAuth, async ctx => {
  try {
    const { id } = ctx.params
    const patient = await getUser({
      _id: id
    }, 'email patient_info.name patient_info.last_name patient_info.phone_number patient_info.DNI patient_info.birthdate patient_info.insurance_type patient_info.location patient_info.medical_history patient_info.drug_allergy patient_info.children')
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
