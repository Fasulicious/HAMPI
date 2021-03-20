'use strict'

import Router from 'koa-router'
import multer from 'koa-multer'
import bcrypt, { genSalt, hash } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

import uploadS3 from '../utils'

import Appointment from '../db/models/appointment'

import {
  isAuth
} from '../middlewares/auth'

import {
  createUser,
  getUser,
  getUsers,
  updateUser
} from '../db/queries/user'

import {
  createDiagnosis,
  getDiagnosis
} from '../db/queries/diagnosis'

import {
  createRecipe, updateRecipe
} from '../db/queries/recipe'

const router = new Router({ prefix: '/doctor' })

const upload = multer()

// Get all doctors
router.get('/', async ctx => {
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
    console.log(`Error trying to retrieve information on /doctor/, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to retrieve information'
      }
    }
  }
})

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

// Edit image profile
router.put('/picture', isAuth, upload.fields([
  {
    name: 'avatar'
  },
  {
    name: 'sign_stamp'
  }
]), async ctx => {
  try {
    const update = {}
    const id1 = uuidv4()
    const id2 = uuidv4()
    const keys = Object.keys(ctx.request.files)
    for (const key of keys) {
      // await uploadS3(ctx.request.files[key].path, key, ctx.state.user._id)
      await uploadS3(ctx.request.files[key].path, key, key === 'avatar' ? id1 : id2)
    }
    // update['doctor_info.avatar'] = `https://mindtec-hampi.s3.amazonaws.com/avatar/${ctx.state.user._id}`
    // update['doctor_info.sign_stamp'] = `https://mindtec-hampi.s3.amazonaws.com/sign_stamp/${ctx.state.user._id}`
    update['doctor_info.avatar'] = `https://mindtec-hampi.s3.amazonaws.com/avatar/${id1}`
    update['doctor_info.sign_stamp'] = `https://mindtec-hampi.s3.amazonaws.com/sign_stamp/${id2}`
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
      doctor_info: user.doctor_info
    }
  } catch (e) {
    console.log(`Error trying to edit information on /router/doctor/picture, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit pictures'
      }
    }
  }
})

// Edit profile
router.put('/', isAuth/*, upload.fields([
  {
    name: 'avatar'
  },
  {
    name: 'sign_stamp'
  }
]) */, async ctx => {
    try {
      const update = {}
      /*
    const keys = Object.keys(ctx.request.files)
    if (keys || keys.length === 0) {
      for (const key of keys) {
        await uploadS3(ctx.request.files[key].path, key, ctx.state.user._id)
      }
      update['doctor_info.avatar'] = `https://mindtec-hampi.s3.amazonaws.com/avatar/${ctx.state.user._id}`
      update['doctor_info.sign_stamp'] = `https://mindtec-hampi.s3.amazonaws.com/sign_stamp/${ctx.state.user._id}`
    }
    */
      const info = ctx.request.body
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
      ctx.body = {
        email: user.email,
        doctor_info: user.doctor_info
      }
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
    console.log(`Error trying to retrieve information on /router/doctor/, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to retrieve information'
      }
    }
  }
})

router.get('/specialty/:specialty', async ctx => {
  try {
    const { specialty } = ctx.params
    const users = await getUsers({
      'doctor_info.specialty': specialty,
      'doctor_info.active': true
    }, {
      email: 1,
      doctor_info: 1
    })
    ctx.status = 200
    ctx.body = users
  } catch (e) {
    console.log(`Error trying to retrieve information on /router/doctor/specialty, ${e}`)
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
    const today = new Date(parseInt(timestamp))
    const tomorrow = new Date(parseInt(timestamp) + 24 * 60 * 60 * 1000)
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
          patient_id: '$patient._id',
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

// Create diagnosis
router.post('/diagnosis', isAuth, async ctx => {
  try {
    const {
      patient,
      ailments,
      main_condition: mainCondition,
      secundary_condition_1: secundaryCondition1,
      secundary_condition_2: secundaryCondition2
    } = ctx.request.body
    await createDiagnosis({
      patient,
      ailments,
      main_condition: mainCondition,
      secundary_condition_1: secundaryCondition1,
      secundary_condition_2: secundaryCondition2
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to get appointments on /router/doctor/diagnosis, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to create diagnosis'
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
    if (diagnosis.doctor.toString() !== ctx.state.user._id.toString()) {
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

// Create Recipe
router.post('/recipe', isAuth, async ctx => {
  try {
    const {
      patient,
      appointment,
      medication
    } = ctx.request.body
    await createRecipe({
      patient,
      doctor: ctx.state.user._id,
      appointment,
      medication
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to get appointments on /router/doctor/recipe, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to create recipe'
      }
    }
  }
})

// Edit Recipe
router.put('/recipe/:id', isAuth, async ctx => {
  try {
    const { id } = ctx.params
    const update = ctx.request.body
    await updateRecipe({
      _id: id
    }, {
      ...update
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to edit recipe on /router/doctor/recipe, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit recipe'
      }
    }
  }
})

// Get patient
router.get('/patient/:id', isAuth, async ctx => {
  try {
    const { id } = ctx.params
    const patient = await getUser({
      _id: id
    }, 'email patient_info.name patient_info.last_name patient_info.avatar patient_info.phone_number patient_info.DNI patient_info.birthdate patient_info.insurance_type patient_info.location patient_info.medical_history patient_info.drug_allergy patient_info.children patient_info.weight patient_info.height')
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
