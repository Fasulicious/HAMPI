'use strict'

import Outcome from '../models/outcome'

export const createOutcome = (outcome) => Outcome.create(outcome)

export const updateOutcome = (where, update) => Outcome.findOneAndUpdate(where, update)
