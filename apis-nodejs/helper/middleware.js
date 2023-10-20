const _ = require('lodash')

const jwtUtils = require('./jwt')
const _v = require('./validation.js')
const {
  UserModel
} = require('./models')
const commonUtils = require('./commonUtils')
const {
  resStatusCode
} = require('./constant')

const middleware = {}

middleware.isAuthenticate = (req, res, next) => {
  if (req.method === 'OPTIONS') return next()

  const {
    byPassRoute
  } = req

  let {
    path
  } = req
  if (byPassRoute.length) {
    path = path.trim()

    const isRoute = byPassRoute.includes(path)

    if (isRoute) {
      return next()
    }
  }

  const token = req.headers['x-auth-token']
  let response = {
    success: false,
    message: req.t('NO_TOKEN')
  }
  if (!token) return res.status(resStatusCode.error.unauthorized).json(response)
  try {
    const decoded = jwtUtils.decodeToken(token)

    req.user = decoded
    next()
  } catch (err) {
    response = {
      success: false,
      message: req.t('INVALID_TOKEN')
    }
    return res.status(resStatusCode.error.badRequest).json(response)
  }
}

middleware.isAuthenticatedUser = async (req, res, next) => {

  // console.log('Validate isAuthenticatedUser -- 1')

  const token = req.headers['x-auth-token']
  if (!token) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('INVALID_TOKEN'))
    return res.status(response.statusCode).json(response)
  }
  const userData = jwtUtils.decodeToken(token);
  if (!userData) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('INVALID_TOKEN'))
    return res.status(response.statusCode).json(response)
  }

  // console.log('Validate isAuthenticatedUser -- 2')

  UserModel.findOne({
    _id: userData.uid
  }).then(async (user) => {
    if (user) {
      if(!(user.jwtTokens).includes(token)){
        const response = await commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('INVALID_TOKEN'))
        return res.status(response.statusCode).json(response)
      }
      req.userInfo = user
      next()
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('INVALID_TOKEN'))
      return res.status(response.statusCode).json(response)
    }
  }).catch(async () => {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('INVALID_TOKEN'))
    return res.status(response.statusCode).json(response)
  })
}

middleware.reqValidator = (req, res, next) => {

  // console.log('Validate reqValidator -- 1')

  const {
    validations
  } = req
  const error = _v.validate(req, validations)
  if (!_.isEmpty(error)) {
    res.status(error.statusCode).json(error)
  } else {
    // console.log('Validate reqValidator -- 2')
    next()
  }
}

module.exports = middleware
