'use strict'

import mongoose, { Schema } from 'mongoose'

const DiagnosisSchema = new Schema({
  ailments: String,
  main_condition: String,
  secundary_condition_1: String,
  secundary_condition_2: String,
})

export default mongoose.model('diagnosis', DiagnosisSchema)