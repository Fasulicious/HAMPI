'use strict'

import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({
  type: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  patient_info: {
    name: {
      type: String
    },
    last_name: {
      type: String
    },
    DNI: {
      type: String,
      unique: true
    },
    phone_number: {
      type: String
    }
  },
  doctor_info: {

  }
})

export default mongoose.model('user', UserSchema)
