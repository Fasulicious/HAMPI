'use strict'

import mongoose, { Schema } from 'mongoose'

const AppointmentSchema = new Schema({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  specialty: String,
  date: {
    day: Number,
    month: Number,
    year: Number
  },
  time: {
    hour: Number,
    minutes: Number
  },
  qualifitacion: {
    type: String,
    enum: ['Like', 'Dislike']
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
