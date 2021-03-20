'use strict'

import Router from 'koa-router'
import bcrypt, { genSalt, hash } from 'bcryptjs'
import multer from 'koa-multer'
import sgMail from '@sendgrid/mail'
import { v4 as uuidv4 } from 'uuid'

import uploadS3 from '../utils'

import Appointment from '../db/models/appointment'
import Recipe from '../db/models/recipe'

import {
  isAuth
} from '../middlewares/auth'

import {
  createUser,
  getUser,
  updateUser
} from '../db/queries/user'

import {
  getAppointment,
  updateAppointment,
  createAppointment
} from '../db/queries/appointment'

import {
  getDiagnosis
} from '../db/queries/diagnosis'

const router = new Router({ prefix: '/patient' })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const upload = multer()

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
router.put('/', isAuth, /* upload.single('avatar'), */async ctx => {
  try {
    const update = {}
    /*
    if (ctx.request.files.avatar) {
      await uploadS3(ctx.request.files.avatar.path, 'avatar', ctx.state.user._id)
      update['patient_info.avatar'] = `https://mindtec-hampi.s3.amazonaws.com/avatar/${ctx.state.user._id}`
    }
    */
    const info = ctx.request.body
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
    ctx.body = {
      email: user.email,
      patient_info: user.patient_info
    }
  } catch (e) {
    console.log(`Error trying to edit information on /router/patient/, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit information'
      }
    }
  }
})

// Edit image profile
router.put('/picture', isAuth, upload.single('avatar'), async ctx => {
  try {
    const update = {}
    const id = uuidv4()
    // await uploadS3(ctx.request.files.avatar.path, 'avatar', ctx.state.user._id)
    // update['patient_info.avatar'] = `https://mindtec-hampi.s3.amazonaws.com/avatar/${ctx.state.user._id}`
    await uploadS3(ctx.request.files.avatar.path, 'avatar', id)
    update['patient_info.avatar'] = `https://mindtec-hampi.s3.amazonaws.com/avatar/${id}`
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
    ctx.body = {
      email: user.email,
      patient_info: user.patient_info
    }
  } catch (e) {
    console.log(`Error trying to edit information on /router/patient/picture, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit pictures'
      }
    }
  }
})

// Get profiñe
router.get('/me', isAuth, async ctx => {
  try {
    const user = await getUser({
      _id: ctx.state.user._id
    }, {
      email: 1,
      patient_info: 1
    })
    ctx.status = 200
    ctx.body = user
  } catch (e) {
    console.log(`Error trying to retrieve information on /router/patient/me, ${e}`)
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
    console.log(`Error trying to change password on /router/patients/change-pass, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to change password'
      }
    }
  }
})

// Create appointment
router.post('/appointment', isAuth, async ctx => {
  try {
    const {
      doctor,
      specialty,
      date,
      cost
    } = ctx.request.body
    const appointment = await createAppointment({
      doctor,
      patient: ctx.state.user._id,
      specialty,
      date,
      cost
    })
    const doctorInfo = await getUser({
      _id: doctor
    }, {
      doctor_info: 1
    })
    let availability = doctorInfo.doctor_info.availability
    availability = availability.map(schedule => {
      if (new Date(schedule.start).valueOf() === new Date(date).valueOf()) {
        return {
          start: schedule.start,
          end: schedule.end,
          taken: !schedule.taken
        }
      }
      return schedule
    })
    await updateUser({
      _id: ctx.state.user._id
    }, {
      $push: {
        'patient_info.appointments': appointment._id
      }
    })
    await updateUser({
      _id: doctor
    }, {
      'doctor_info.availability': availability
    })
    await updateUser({
      _id: doctor
    }, {
      $push: {
        'doctor_info.appointments': appointment._id
      }
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to create appointment on /router/patient/appointments, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to create appointment'
      }
    }
  }
})

// Get Appointment
router.get('/appointment', isAuth, async ctx => {
  try {
    const appointments = await Appointment.aggregate([
      {
        $match: {
          patient: ctx.state.user._id
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $project: {
          doctor: {
            $concat: ['$doctor.doctor_info.name', ' ', '$doctor.doctor_info.last_name']
          },
          doctor_id: '$doctor._id',
          specialty: '$specialty',
          date: '$date',
          qualification: '$qualification',
          cost: '$cost',
          diagnosis: '$diagnosis',
          recipe: '$recipe'
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ])
    const appointmentHistory = []
    const upcomingAppointments = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    appointments.map(appointment => {
      if (appointment.date > today) upcomingAppointments.push({ ...appointment })
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
router.get('/diagnosis/:id', isAuth, async ctx => {
  try {
    const { id } = ctx.params
    const diagnosis = await getDiagnosis({
      _id: id
    }, {
      patient: 1,
      ailments: 1,
      main_condition: 1,
      secundary_condition_1: 1,
      secundary_condition_2: 1
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
// PENDING
router.get('/recipe/:id', isAuth, async ctx => {
  try {
    const { id } = ctx.params
    /*
    const recipe = await getRecipe({
      _id: id
    })
    */
    const recipe = await Recipe.aggregate([
      {
        $match: {
          _id: id
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
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $lookup: {
          from: 'diagnosis',
          localField: 'diagnosis',
          foreignField: '_id',
          as: 'diagnosis'
        }
      }
    ])
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
router.get('/doctor/:id', isAuth, async ctx => {
  try {
    const { id } = ctx.params
    const doctor = await getUser({
      _id: id
    }, 'email doctor_info.name doctor_info.last_name doctor_info.avatar doctor_info.phone_number doctor_info.experience doctor_info.specialty doctor_info.introduction doctor_info.subspecialty doctor_info.graduates doctor_info.masters_degrees doctor_info.doctorates doctor_info.workplace doctor_info.university doctor_info.availability')
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
router.put('/appointment/:id', isAuth, async ctx => {
  try {
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
