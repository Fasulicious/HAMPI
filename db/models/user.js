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
      type: String
    },
    phone_number: {
      type: String
    },
    avatar: {
      type: String
    },
    birthdate: Date,
    insurance_type: {
      type: String,
      enum: ['rimac eps/seguros', 'mapfre eps/seguros', 'pacifico eps/seguros', 'sanitas peru/eps', 'la positiva eps/seguros', 'la protectora', 'semefa', 'otros']
    },
    location: {
      district: String,
      province: String,
      department: String
    },
    medical_history: [{
      type: String,
      enum: ['hipertension arterial', 'diabetes mellitus', 'cancer', 'enfermedad de la tiroides', 'infarto miocardio', 'acv (derrame)-isquemia', 'enfermedad hepatica', 'enfermedad renal', 'artritis-artrosis', 'glaucoma o enfermedad en ojos', 'obesidad', 'exposicion a ruido laboral', 'epilepsia', 'vasculitis o enfermedad reumatologica', 'condicion mental']
    }],
    drug_allergy: [{
      type: String,
      enum: ['penicilina', 'aines', 'sulfametoxazol', 'yodo', 'ciprofloxacino', 'corticoides', 'tramadol', 'benzodiazepinas', 'azitromicina', 'paracetamol', 'metamizol']
    }],
    appointments: [{
      type: Schema.Types.ObjectId,
      ref: 'appointment'
    }],
    children: Number,
    weight: Number,
    height: Number
  },
  doctor_info: {
    name: {
      type: String
    },
    last_name: {
      type: String
    },
    DNI: {
      type: String
    },
    phone_number: {
      type: String
    },
    avatar: {
      type: String
    },
    sign_stamp: {
      type: String
    },
    experience: {
      type: String,
      enum: ['menor de 5 años', 'entre 5 a 15 años', 'entre 15 a 30 años', 'mayor de 30 años']
    },
    specialty: {
      type: String,
      enum: ['adolescentologia', 'alergia e inmunologia/infantil', 'cardiologia/infantil', 'cirugia cardiovascular/pediatrica', 'cirugia cabeza, cuello y maxilofacial', 'cirugia de mano', 'cirugia de rodilla', 'cirugia de torax y cardiovascular', 'cirugia general', 'cirugia oncologica abdominal', 'cirugia oncologica cabeza y cuello', 'cirugia oncologica de mamas', 'cirugia ortopedia y traumatologia', 'cirugia pediatrica', 'cirugia plastica y facial', 'cirugia plastica y reconstructiva', 'dermatologia', 'dermatologia pediatrica', 'endocrinologia', 'endocrinologia pediatrica', 'enfermedades infecciosas/infectologia', 'flebologia', 'gastroenterologia', 'gastroenterologia pediatrica', 'geriatria', 'ginecologia y obstetricia', 'ginecologia oncologica', 'hematologia/pediatrica', 'medicina familiar y comunitaria', 'medicina interna', 'medicina integrativa y ortomolecular', 'medicina fisica y rehabilitacion', 'nefrologia/pediatrica', 'neonatologia', 'neumologia/pediatrica', 'neurocirugia/pediatrica', 'neurologia/pediatrica', 'nutricion', 'oftalmologia/pediatrica', 'oncologia/pediatrica', 'oncologia radioterapia', 'ortopedia y traumatologia', 'otorrinolaringologia/pediatrica', 'pediatria/puericultura', 'psiquiatria/infantil y adolescentes', 'psiquiatria de adicciones', 'psicologia', 'reumatologia', 'urologia/pediatrica', 'urologia oncologica']
    },
    payment_method: {
      type: String,
      enum: ['suscripcion']
    },
    subspecialty: [String],
    graduates: [String],
    masters_degrees: [String],
    doctorates: [String],
    university: String,
    workplace: [String],
    introduction: {
      type: String
    },
    payments: [{
      date: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'paid'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }],
    appointments: [{
      type: Schema.Types.ObjectId,
      ref: 'appointment'
    }],
    active: {
      type: Boolean,
      default: false
    }
  }
})

export default mongoose.model('user', UserSchema)
