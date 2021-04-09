'use strict'

import mongoose, { Schema } from 'mongoose'

const OutcomeSchema = new Schema({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  amount: {
    type: Number,
    required: true
  },
  paid_date: Date,
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
})

export default mongoose.model('outcome', OutcomeSchema)
