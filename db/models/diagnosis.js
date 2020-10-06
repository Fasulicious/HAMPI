'use strict'

import mongoose, { Schema } from 'mongoose'

const DiagnosisSchema = new Schema({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  ailments: String,
  main_condition: String,
  secundary_condition_1: String,
  secundary_condition_2: String
})

export default mongoose.model('diagnosis', DiagnosisSchema)
