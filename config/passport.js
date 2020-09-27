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
      if (!user) return done(null, false, { message: 'Usuario no encontrado ' })
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(null, false, { message: 'Problemas al comparar contraseñas. Intente de nuevo.' })
        if (!isMatch) return done(null, false, { message: 'Contraseña incorrecta' })
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
