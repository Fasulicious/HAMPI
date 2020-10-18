'use strict'

import mongoose, { Schema } from 'mongoose'

const AppointmentSchema = new Schema({
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
    type: String,
    enum: ['like', 'dislike']
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
