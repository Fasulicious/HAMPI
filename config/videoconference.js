'use strict'
/* eslint-disable new-cap */
import opentok from 'opentok'

const OT = new opentok(process.env.OT_API_KEY, process.env.OT_API_SECRET)

export default OT
