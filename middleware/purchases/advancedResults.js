const { Op } = require('sequelize')
const { PurchaseAttachment } = require('../../models')

const advancedResults = (model, populate) => async (req, res, next) => {
  let query

  // Copy req.query
  const reqQuery = { ...req.query }

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit']

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param])

  const getPagination = (page, size) => {
    const limit = size ? +size : 25
    const offset = page ? page * limit : 0
    return { limit, offset }
  }

  const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: records } = data
    const currentPage = page ? +page : 0
    const totalPages = Math.ceil(totalItems / limit)
    return { totalItems, records, totalPages, currentPage }
  }

  const { page, size } = req.query
  const { limit, offset } = getPagination(page, size)

  const order = [['createdAt', 'desc']]

  const include = {
      model: PurchaseAttachment,
      attributes: ['fileName', 'uuid'],
      order: [['createdAt', 'desc']],
  }

  // Set query
  if(reqQuery.purchaseId) {
    query = model.findAndCountAll({
      where: {
        purchaseId: reqQuery.purchaseId
      },
      include
    })
  } else if(reqQuery.hideCompleted) {
    query = model.findAndCountAll({
      where: {
        status: {
          [Op.notIn]: ['Completed', 'Denied']
        }
      },
      order,
      include
    })
  } else if(reqQuery.vendor) {
    query = model.findAndCountAll({
      where: {
        vendor: {
          [Op.like]: "%" + reqQuery.vendor + "%"
        }
      },
      order,
      include
    })
  } else if(reqQuery.purchaseDestination) {
    query = model.findAndCountAll({
      where: {
        purchaseDestination: reqQuery.purchaseDestination
      },
      order,
      include
    })
  } else {
    query = model.findAndCountAll({
      order,
      include
    })
  }

  // Execute query
  let results = await query

  if(results) {
    results = getPagingData(results, page, limit)
  }

  res.advancedResults = {
    success: true,
    data: results,
  }

  next()
}

module.exports = advancedResults