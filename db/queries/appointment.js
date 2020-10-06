'use strict'

import Appointment from '../models/appointment'

export const getAppointments = (where, select) => Appointment.find(where).select(select)

export const getAppointment = (where, select) => Appointment.findOne(where).select(select)

export const updateAppointment = (where, update, options) => Appointment.findOneAndUpdate(where, update, options)
