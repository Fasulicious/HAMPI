'use strict'

import Router from 'koa-router'
import passport from 'koa-passport'

import {
  isAuth,
  isAdmin
} from '../middlewares/auth'

import {
  getUser,
  getUsers,
  updateUser
} from '../db/queries/user'

import {
  createMedication,
  getMedications,
  getMedication,
  updateMedication
} from '../db/queries/medication'

import {
  getAppointmentCost,
  updateAppointmentCost
} from '../db/queries/appointment_cost'

import Income from '../db/models/income'

import Outcome from '../db/models/outcome'

import Medication from '../db/models/medication'

import User from '../db/models/user'

import Appointment from '../db/models/appointment'

import Qualification from '../db/models/qualification'

import { updateOutcome } from '../db/queries/outcome'

const router = new Router({ prefix: '/admin' })

router.post('/login', async (ctx, next) => {
  return passport.authenticate('local', async (err, user) => {
    if (err) {
      console.log(`Error login user on /admin/login, ${err}`)
      ctx.status = 500
      ctx.body = {
        error: {
          message: err.message
        }
      }
      return
    }
    if (user.type !== 'admin') {
      ctx.status = 401
      ctx.body = {
        error: {
          message: 'You have no access'
        }
      }
    }
    ctx.status = 200
    return ctx.login(user)
  })(ctx, next)
})

router.get('/logout', isAuth, isAdmin, async ctx => {
  try {
    ctx.logout()
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to log out on /admin/logout, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to log out'
      }
    }
  }
})

router.post('/medication', isAuth, isAdmin, async ctx => {
  try {
    const {
      product_code: productCode,
      product_name: productName,
      concentration,
      drugstore_name: drugstoreName,
      simplified_drugstore_name: simplifiedDrugstoreName,
      display,
      portion,
      laboratory
    } = ctx.request.body
    await createMedication({
      product_code: productCode,
      product_name: productName,
      concentration,
      drugstore_name: drugstoreName,
      simplified_drugstore_name: simplifiedDrugstoreName,
      display,
      portion,
      laboratory
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to create medication on /admin/medication, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to create medication'
      }
    }
  }
})
/*
router.get('/medication/:code_or_name', isAuth, isAdmin, async ctx => {
  const { code_or_name: codeOrName } = ctx.params
  //const medications = await Medication.find({})
  console.log(codeOrName)
  const user = await User.find({
    email: codeOrName
  })
  console.log(user)
  ctx.status = 200
  ctx.body = user
})
*/

router.get('/medication', isAuth, isAdmin, async ctx => {
  try {
    const medications = await getMedications({}, 'product_name product_code concentration drugstore_name simplified_drugstore_name display portion laboratory')
    ctx.status = 200
    ctx.body = medications
  } catch (e) {
    console.log(`Error trying to get doctors on /admin/medication, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get medications'
      }
    }
  }
})

router.get('/equivalence/:code', isAuth, isAdmin, async ctx => {
  try {
    const { code } = ctx.params
    const equivalenceCodes = await getMedication({
      product_code: code
    }, 'equivalence')
    const medications = await Medication.find({
      _id: {
        $in: equivalenceCodes.equivalence
      }
    })
    ctx.status = 200
    ctx.body = medications
  } catch (e) {
    console.log(`Error trying to get doctors on /admin/medication, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get medications'
      }
    }
  }
})

router.put('/medication/:code', isAuth, isAdmin, async ctx => {
  try {
    const {
      type,
      equivalence
    } = ctx.request.body
    const { code } = ctx.params
    let equivalenceCodes = (await getMedication({
      product_code: code
    }, 'equivalence')).equivalence
    if (type === 'remove') equivalenceCodes = equivalenceCodes.filter(code => code !== equivalence)
    else equivalenceCodes.push(equivalence)
    await updateMedication({
      product_code: code
    }, {
      equivalence: equivalenceCodes
    }, {
      returnOriginal: false
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to get doctors on /admin/medication/:code, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit medications'
      }
    }
  }
})

router.get('/doctor', isAuth, isAdmin, async ctx => {
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
    console.log(`Error trying to get doctors on /admin/doctor, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get doctor info'
      }
    }
  }
})

router.put('/doctor/:id', isAuth, isAdmin, async ctx => {
  try {
    const { id } = ctx.params
    const { email } = ctx.request.body
    await updateUser({
      _id: id
    }, {
      email
    }, {
      returnOriginal: false
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to edit doctor info on /admin/doctor, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit doctor info'
      }
    }
  }
})

router.get('/doctor/activate/:id', isAuth, isAdmin, async ctx => {
  try {
    const { id } = ctx.params
    const doctor = await getUser({
      type: 'doctor',
      _id: id
    }, {
      doctor_info: 1
    })
    if (doctor) {
      const status = doctor.doctor_info.active
      await updateUser({
        type: 'doctor',
        _id: id
      }, {
        'doctor_info.active': !status
      }, {
        returnOriginal: false
      })
      ctx.status = 200
      return
    }
    ctx.status = 404
    ctx.body = {
      msg: 'Doctor not found'
    }
  } catch (e) {
    console.log(`Error trying to activate doctor on /admin/activate, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to activate doctor'
      }
    }
  }
})

router.get('/patient/activate/:id', isAuth, isAdmin, async ctx => {
  try {
    const { id } = ctx.params
    const patient = await getUser({
      type: 'patient',
      _id: id
    }, {
      patient_info: 1
    })
    if (patient) {
      const status = patient.patient_info.active
      await updateUser({
        type: 'patient',
        _id: id
      }, {
        'patient_info.active': !status
      }, {
        returnOriginal: false
      })
      ctx.status = 200
      return
    }
    ctx.status = 404
    ctx.body = {
      msg: 'Patient not found'
    }
  } catch (e) {
    console.log(`Error trying to activate patient on /admin/activate, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to activate patient'
      }
    }
  }
})

router.get('/patient', isAuth, isAdmin, async ctx => {
  try {
    const patients = await getUsers({
      type: 'patient'
    }, {
      email: 1,
      patient_info: 1
    })
    ctx.status = 200
    ctx.body = patients
  } catch (e) {
    console.log(`Error trying to get patients on /admin/patient, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get patient info'
      }
    }
  }
})

router.get('/cost', isAuth, isAdmin, async ctx => {
  try {
    const cost = (await getAppointmentCost({
      name: 'default'
    }, {
      cost: 1
    })).cost
    ctx.status = 200
    ctx.body = cost
  } catch (e) {
    console.log(`Error trying to get appointment costs on /admin/cost, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get appointment cost'
      }
    }
  }
})

router.put('/cost', isAuth, isAdmin, async ctx => {
  try {
    const {
      cost
    } = ctx.request.body
    await updateAppointmentCost({
      name: 'default'
    }, {
      cost
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to edit appointment costs on /admin/cost, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to edit appointment cost'
      }
    }
  }
})

router.get('/income/month/:month/year/:year', isAuth, isAuth, async ctx => {
  try {
    const {
      month,
      year
    } = ctx.params
    const incomes = await Income.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(parseInt(year), parseInt(month)),
            $lt: new Date(parseInt(year), parseInt(month) + 1)
          }
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
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      }
    ])
    ctx.status = 200
    ctx.body = incomes
  } catch (e) {
    console.log(`Error trying to get incomes on /admin/income, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get incomes'
      }
    }
  }
})

router.get('/outcome/month/:month/year/:year', isAuth, isAuth, async ctx => {
  try {
    const {
      month,
      year
    } = ctx.params
    const incomes = await Outcome.aggregate([
      {
        $match: {
          $or: [
            {
              date: {
                $gte: new Date(parseInt(year), parseInt(month)),
                $lt: new Date(parseInt(year), parseInt(month) + 1)
              },
              status: 'paid'
            },
            {
              status: 'pending'
            }
          ]
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
          doctor_name: {
            $concat: ['$doctor.doctor_info.name', ' ', '$doctor.doctor_info.last_name']
          },
          doctor_email: '$doctor.email',
          amount: '$amount',
          date: '$paid_date',
          status: '$status'
        }
      }
    ])
    ctx.status = 200
    ctx.body = incomes
  } catch (e) {
    console.log(`Error trying to get incomes on /admin/income, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get incomes'
      }
    }
  }
})

router.get('/income/from/:from/to/:to', isAuth, isAuth, async ctx => {
  try {
    const {
      from,
      to
    } = ctx.params
    const incomes = await Income.aggregate([
      {
        $match: {
          date: {
            $gte: from,
            $lt: to
          }
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
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      }
    ])
    ctx.status = 200
    ctx.body = incomes
  } catch (e) {
    console.log(`Error trying to get incomes on /admin/income, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get incomes'
      }
    }
  }
})

router.get('/outcome/:email', isAuth, isAdmin, async ctx => {
  try {
    const { email } = ctx.params
    const doctor = await User.aggregate([
      {
        $match: {
          email
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '$doctor_info.payments',
          foreignField: '_id',
          as: 'payment'
        }
      },
      {
        $unwind: '$payment'
      }
    ])
    ctx.status = 200
    ctx.body = doctor
  } catch (e) {
    console.log(`Error trying to get outcomes on /admin/outcome, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get outcomes'
      }
    }
  }
})

router.put('/outcome/:id', isAuth, isAdmin, async ctx => {
  try {
    const { id } = ctx.params
    const { date } = ctx.request.body
    await updateOutcome({
      _id: id
    }, {
      paid_date: date,
      status: 'paid'
    })
    ctx.status = 200
  } catch (e) {
    console.log(`Error trying to create outcomes on /admin/outcome, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to create outcomes'
      }
    }
  }
})

router.get('/appointment', isAuth, isAdmin, async ctx => {
  try {
    const apps = await Appointment.aggregate([
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
          doctor_name: {
            $concat: ['$doctor.doctor_info.name', ' ', '$doctor.doctor_info.last_name']
          },
          doctor_email: '$doctor.email',
          specialty: '$doctor.doctor_info.specialty',
          patient_name: {
            $concat: ['$patient.patient_info.name', ' ', '$patient.patient_info.last_name']
          },
          patient_email: '$patient.email',
          date: '$date'
        }
      }
    ])
    ctx.status = 200
    ctx.body = apps
  } catch (e) {
    console.log(`Error trying to get appointments on /admin/appointment, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get appointments'
      }
    }
  }
})

router.get('/dislike/:doctor', isAuth, isAdmin, async ctx => {
  try {
    const { doctor } = ctx.params
    const ids = await getUser({
      _id: doctor
    }, 'doctor_info.dislikes')
    // verificar dislikes
    const dislikes = await Qualification.aggregate([
      {
        $match: {
          $in: ids
        }
      },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment',
          foreignField: '_id',
          as: 'appointment'
        }
      },
      {
        $unwind: '$appointment'
      },
      {
        $lookup: {
          from: 'users',
          localField: '$appointment.patient',
          foreignField: '_id',
          as: 'patient'
        }
      },
      {
        $unwind: '$patient'
      },
      {
        $project: {
          name: {
            $concat: ['$patient.name', ' ', '$patient.last_name']
          },
          email: '$patient.email',
          phone_number: '$patient.phone_number',
          date: '$appointment.date'
        }
      }
    ])
    ctx.status = 200
    ctx.body = dislikes
  } catch (e) {
    console.log(`Error trying to get qualification on /admin/dislike, ${e}`)
    ctx.status = 500
    ctx.body = {
      error: {
        message: 'Error trying to get qualification'
      }
    }
  }
})

export default router
