'use strict'

import AppointmentCost from '../models/appointment_cost'

export const createAppointmentCost = (cost) => AppointmentCost.create(cost)

export const updateAppointmentCost = (where, update, options) => AppointmentCost.findOneAndUpdate(where, update, options)

export const getAppointmentCost = (where, select) => AppointmentCost.findOne(where).select(select)
