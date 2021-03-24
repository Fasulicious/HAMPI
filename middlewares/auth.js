'use strict'

export const isAuth = (ctx, next) => {
  const auth = ctx.isAuthenticated()
  if (!auth) {
    ctx.status = 401
    ctx.body = {
      message: 'You have no access to do this request'
    }
    return
  }
  return next()
}

export const isAdmin = (ctx, next) => {
  if (ctx.state.user.type === 'admin') return next()
}
