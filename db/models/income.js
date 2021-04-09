'use strict'

import mongoose, { Schema } from 'mongoose'

const IncomeSchema = new Schema({
  culqi_id: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'appointment'
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
})

export default mongoose.model('income', IncomeSchema)
