const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }

  if(err.name === 'SequelizeValidationError') {
    error.message = err.errors.map(e => e.message)
    error = new ErrorResponse(error.message, 500)
  } else {
    error = new ErrorResponse(err.message)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}

module.exports = errorHandler