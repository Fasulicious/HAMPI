import mongoose, { Schema } from 'mongoose'

const MedicationSchema = new Schema({
  product_code: {
    type: String,
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  concentration: {
    type: String,
    required: true
  },
  drugstore_name: {
    type: String,
    required: true
  },
  simplified_drugstore_name: {
    type: String,
    required: true
  },
  display: {
    type: String,
    required: true
  },
  portion: {
    type: String,
    required: true
  },
  laboratory: {
    type: String,
    required: true
  },
  equivalence: [{
    type: Schema.Types.ObjectId,
    ref: 'medication'
  }]
})

export default mongoose.model('medication', MedicationSchema)
