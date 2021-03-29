'use strict'

import mongoose, { Schema } from 'mongoose'

const PaymentSchema = new Schema({
  culqi_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
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

export default mongoose.model('payment', PaymentSchema)
