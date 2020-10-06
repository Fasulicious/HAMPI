'use strict'

import mongoose, { Schema } from 'mongoose'

const RecipeSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'appointment'
  },
  diagnosis: {
    type: Schema.Types.ObjectId,
    ref: 'diagnosis'
  },
  medication: [{
    medication: String,
    pills: String,
    syrup: String,
    drops: String,
    injectable: String,
    inhaler: String,
    topical: String,
    envelopes: String,
    days: Number,
    frequency: String,
    observations: String
  }],
  signature: String,
  stamp: String
})

export default mongoose.model('recipe', RecipeSchema)
