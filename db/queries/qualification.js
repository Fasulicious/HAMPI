'use strict'

import Qualification from '../models/qualification'

export const createQualification = (qualification) => Qualification.create(qualification)
