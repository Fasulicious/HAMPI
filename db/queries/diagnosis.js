'use strict'

import Diagnosis from '../models/diagnosis'

export const getDiagnosis = (where, select) => Diagnosis.findOne(where).select(select)
