'use strict'

import mongoose, { Schema } from 'mongoose'

const AppointmentCostSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  culqi_percentage: Number,
  doctor_percentage: Number
})

export default mongoose.model('appointment_cost', AppointmentCostSchema)
