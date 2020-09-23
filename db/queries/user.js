'use strict'

import User from '../models/user'

export const createUser = (user) => User.create(user)

export const updateUser = (where, update, options) => User.findOneAndUpdate(where, update, options)

export const getUser = (where) => User.findOne(where)

export const getUsers = (where, select) => User.find(where).select(select)
