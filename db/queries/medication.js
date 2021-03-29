'use strict'

import Medication from '../models/medication'

export const createMedication = (medication) => Medication.create(medication)

export const getMedication = (where, select) => Medication.findOne(where).select(select)

export const getMedications = (where, select) => Medication.find(where).select(select)

export const updateMedication = (where, update, options) => Medication.findOneAndUpdate(where, update, options)
