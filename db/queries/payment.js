'use strict'

import Payment from '../models/payment'

export const createPayment = (payment) => Payment.create(payment)
