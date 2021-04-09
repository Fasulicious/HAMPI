'use strict'

import mongoose, { Schema } from 'mongoose'

const AppointmentSchema = new Schema({
  sessionId: {
    type: String,
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  specialty: String,
  date: Date,
  qualifitacion: {
    type: Schema.Types.ObjectId,
    ref: 'qualification'
  },
  cost: {
    type: Number
  },
  diagnosis: {
    type: Schema.Types.ObjectId,
    ref: 'diagnosis'
  },
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'recipe'
  }
})

export default mongoose.model('appointment', AppointmentSchema)
