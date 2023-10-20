const _ = require('lodash')
const isEmail = require('isemail')
const isAlphaNumeric = require('is-alphanumeric')
const PasswordValidtor = require('password-validator')
const isPhoneNumber = require('validate-phone-number-node-js')

const schema = new PasswordValidtor()
schema
  .is().min(6)
  .is().max(30)

const validateCtr = {}

validateCtr.isDefined = (value) => {
  if (typeof value === 'boolean') return true
}

validateCtr.validEmail = (email) => {
  if (email) {
    return isEmail.validate(email)
  }
  return false
}

validateCtr.validPhoneNo = (mobile) => {
  if (mobile) {
    return isPhoneNumber.validate(mobile)
  }
  return false
}

validateCtr.validEmailOrPhone = (input) => {
  if (input) {
    return this.validEmail(input) || this.validPhoneNo(input)
  }
  return false
}

validateCtr.validPassword = (password) => {
  if (password) {
    return schema.validate(password)
  }
  return false
}

validateCtr.isAlphaNumeric = (input) => {
  if (input) {
    return isAlphaNumeric(input)
  }
  return false
}

validateCtr.notEmpty = (str) => _.isNumber(str) || (!_.isEmpty(str) && !(str.trim() === ''))

validateCtr.isValidMime = (str, options) => {
  if (str) {
    return validateCtr.isValidEnum(str.type, options)
  }
  return true
}

validateCtr.isValidEnum = (str, options) => {
  const {
    aEnum
  } = options
  if (!_.isEmpty(str)) {
    if (!_.isEmpty(aEnum)) {
      if (aEnum.size && aEnum.get(str) !== undefined) { // Enum npm module
        return true
      }
      if (aEnum.length > 0 && aEnum.indexOf(str) !== -1) { // Array Enum
        return true
      }
    }
    return false
  }
  return false
}

const validate = (req, validationRules, parentKey) => {
  const {
    body,
    files,
    query
  } = req
  const orgBody = req.orgBody || body
  let input = {}
  let error = {}

  if (!_.isEmpty(validationRules)) {
    Object.keys(validationRules).every((key) => {
      let validations = validationRules[key]
      if (validations.isFile) {
        input = files
      } else if (validationRules.isQueryParams) {
        input = query
      } else {
        input = body
      }
      if (validations.isOptional && input[key] === undefined) {
        return error
      }
      if (!_.isEmpty(validations.byPassWhen) || typeof validations.byPassWhen === 'function') {
        if (typeof validations.byPassWhen === 'function') {
          if (validations.byPassWhen(orgBody)) {
            return error
          }
        } else if (!_.isEmpty(validations.byPassWhen, input)) {
          return error
        }
      }

      if (validations.hasChilds && validations.hasChilds === true) {
        if (_.isEmpty(input[key])) {
          const generatedError = validateCtr.getGeneratedError((parentKey ? `${parentKey}.` : '') + key, 'notEmpty')
          error = {
            statusCode: 400,
            field: key,
            type: 'notEmpty',
            error: generatedError,
            generatedError
          }
        } else {
          error = validate({
            body: input[key],
            orgBody: body
          }, validations.childs, key)
        }
      }

      if (!_.isArray(validations)) {
        if (_.isEmpty(validations.rules)) {
          validations = [validations]
        } else {
          validations = validations.rules
        }
      }

      validations.every((validation) => {
        if (!_.isEmpty(validation)) {
          const {
            type,
            msg,
            options,
            statusCode
          } = validation

          if (!validateCtr[type](input[key], options)) {
            const generatedError = validateCtr.getGeneratedError((parentKey ? `${parentKey}.` : '') + key, type, options, input[key])
            error = {
              statusCode: statusCode || 400,
              field: key,
              type,
              error: msg ? req.t(msg) : null || generatedError,
              generatedError
            }

            return false
          }
        }
        return true
      })

      if (!_.isEmpty(error)) {
        return false
      }
      return true
    })
  }
  return error
}

validateCtr.getGeneratedError = (field, type, options, str) => {
  switch (type) {
    case 'notEmpty':
      return `${field} is required`
    case 'isValidPhoneNumber':
      return `${field} is not valid`
    case 'isValidMime':
      return `${field} - Unsopported file format`
    case 'isValidEnum':
      return `${field} - Only Support these values [${options.aEnum}]`
    case 'validPassword': {
      return schema.validate(str)
    }
    case 'isAlphanumeric': {
      return `${field} - Invalid input, only supported Alphanumeric chars.`
    }
    case 'isNumberInRange': {
      if (options.max === options.min) {
        return `${field} should be exactly of ${options.min}.`
      }
      if (options.max && options.min) {
        return `${field} should be at-least of ${options.min} and maximum of ${options.max}.`
      }
      if (options.max) {
        return `${field} should maximum of ${options.max}.`
      }
      if (options.min) {
        return `${field} should at-least of ${options.min}.`
      }
      return `${field} - error - ${type}`
    }
    case 'checkLength':
      if (_.isFinite(options.max) === _.isFinite(options.min)) {
        return `${field} should be exactly of ${options.min} characters`
      }
      if (_.isFinite(options.max) && _.isFinite(options.min)) {
        return `${field} should be at-least of ${options.min} and maximum of ${options.max} characters`
      }
      if (_.isFinite(options.max)) {
        return `${field} should maximum of ${options.max} characters`
      }
      if (_.isFinite(options.min)) {
        return `${field} should at-least of ${options.min} characters`
      }
      return `${field} - error - ${type}`
    default:
      return `${field} - error - ${type}`
  }
}

module.exports = {
  validateCtr,
  validate
}
