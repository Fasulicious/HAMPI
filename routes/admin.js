'use strict'

import Router from 'koa-router'
import passport from 'koa-passport'

import {
  isAuth,
  isAdmin
} from '../middlewares/auth'

import {
  getUsers,
  updateUser
} from '../db/queries/user'

import {
  createMedication,
  getMedications,
  getMedication,
  updateMedication
} from '../db/queries/medication'

import Medication from '../db/models/medication'

const router = new Router({ prefix: '/admin' })

router.post('/login', async (ctx, next) => {
  console.log('entre a login')
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
    console.log(user)
    if (user.type !== 'admin') {
      console.log('entre aqui')
      ctx.status = 401
      ctx.body = {
        error: {
          message: 'You have no access'
        }
      }
    }
    console.log('before status')
    ctx.status = 200
    console.log('before return')
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
    const medications = await getMedications({}, 'product_name product_code')
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
        $in: equivalenceCodes
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
    let equivalenceCodes = await getMedication({
      product_code: code
    }, 'equivalence')
    equivalenceCodes = type === 'remove' ? equivalenceCodes = equivalenceCodes.filter(code => code !== equivalence) : equivalenceCodes.push(equivalence)
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

export default router
