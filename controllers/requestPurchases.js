const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const { PurchaseRequest, RequestPurchase, RequestPurchaseAttachment } = require('../models')

// @desc    Create request purchase
// @route   POST /api/v1/ffd/purchasing/requests/purchase/create
// @access  Private
exports.createRequestPurchase = asyncHandler (async (req, res, next) => {
  const { requestId, requestPurchaseId, purchaseDestination, lastFour, OPIQNum, OPIQEntryDate, uuid, createdAt, updatedAt } = req.body

  const createdBy = req.user.email
  const updatedBy = req.user.email

  const requestPurchase = await RequestPurchase.create({
    requestId,
    requestPurchaseId,
    purchaseDestination,
    lastFour,
    OPIQNum,
    OPIQEntryDate,
    uuid,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt
  })

  if(!requestPurchase) {
    return next(new ErrorResponse("Could not create new request purchase", 500))
  }

  // If OPIQNum populated - update request to "Completed"
  if(!OPIQNum) {
    await PurchaseRequest.update({
      status: "Purchased"
    },
    {
      where: {
        requestId
      }
    })
  } else {
    await PurchaseRequest.update({
      status: "Completed"
    },
    {
      where: {
        requestId
      }
    })
  }

  res.status(200).json({
    success: true,
    data: requestPurchase
  })
})

// @desc    Update request purchase
// @route   PUT /api/v1/ffd/purchasing/requests/purchase/update/:uuid
// @access  Private
exports.updateRequestPurchase = asyncHandler (async (req, res, next) => {
  const { purchaseDestination, lastFour, OPIQNum, OPIQEntryDate, updatedAt } = req.body

  const updatedBy = req.user.email

  const requestPurchaseUpdate = await RequestPurchase.update({
    purchaseDestination,
    lastFour,
    OPIQNum,
    OPIQEntryDate,
    updatedBy,
    updatedAt
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true,
    plain: true
  })

  if(!requestPurchaseUpdate) {
    return next(new ErrorResponse(`Could not update request purchase by uuid ${req.params.uuid}`, 500))
  }

  const requestPurchase = await RequestPurchase.findOne({
    where: {
      uuid: req.params.uuid
    }
  })

  const { requestId } = requestPurchase

  // If OPIQNum populated - update request to "Completed"
  if(!OPIQNum) {
    await PurchaseRequest.update({
      status: "Purchased"
    },
    {
      where: {
        requestId
      }
    })
  } else {
    await PurchaseRequest.update({
      status: "Completed"
    },
    {
      where: {
        requestId
      }
    })
  }

  res.status(200).json({
    success: true,
    data: requestPurchase
  })
})

// @desc    Delete request purchase
// @route   DELETE /api/v1/ffd/purchasing/requests/purchase/delete/:uuid
// @access  Private
exports.deleteRequestPurchase = asyncHandler(async (req, res, next) => {
  const requestPurchase = await RequestPurchase.findOne({
    where: {
      uuid: req.params.uuid
    },
    returning: true,
    plain: true
  })

  const { requestId, requestPurchaseId } = requestPurchase

  await PurchaseRequest.update({
    status: "Approved"
  },{
    where: {
      requestId
    }
  })

  if(!requestPurchaseId) {
    return next(new ErrorResponse(`Could not find request purchase with uuid ${req.params.uuid}`, 500))
  }

  await RequestPurchase.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  await RequestPurchaseAttachment.destroy({
    where: {
      requestPurchaseId
    }
  })

  res.status(200).json({
    success: true,
    data: {}
  })
})