'use strict'

import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'

import User from '../db/models/user'

export default passport => {
  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    async (username, password, done) => {
      const user = await User.findOne({ email: username })
      if (!user) return done(new Error('User not found'))
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(new Error('Error while comparing password'))
        if (!isMatch) return done(new Error('Missmatch error'))
        return done(null, user)
      })
    })
  )

  passport.serializeUser((user, done) => done(null, user._id))

  passport.deserializeUser((id, done) => {
    User.findById(id, 'type email').exec((err, user) => {
      done(err, user)
    })
  })
}
