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
    },
    /*
    birthdate: {
      day: Number,
      month: Number,
      year: Number
    },
    */
    birthdate: Date,
    insurance_type: String,
    location: {
      district: String,
      province: String,
      department: String
    },
    medical_history: [String],
    drug_allergy: [String],
    appointments: [{
      type: Schema.Types.ObjectId,
      ref: 'appointment'
    }]
  },
  doctor_info: {

  }
})

export default mongoose.model('user', UserSchema)
