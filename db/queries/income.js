'use strict'

import Income from '../models/income'

export const createIncome = (income) => Income.create(income)
