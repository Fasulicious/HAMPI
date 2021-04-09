'use strict'

import mongoose, { Schema } from 'mongoose'

const QualificationSchema = new Schema({
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'appointment'
  }
})

export default mongoose.model('qualification', QualificationSchema)
