const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const { PurchaseRequest, RequestAttachment, RequestApproval, RequestPurchase, RequestPurchaseAttachment } = require('../models')
const sendStatusEmail = require('../utils/sendStatusEmail')
const sendPendingApprovalEmail = require('../utils/sendPendingApprovalEmail')

// @desc    Get requests
// @route   GET /api/v1/ffd/purchasing/requests
// @access  Private
exports.getRequests = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get request
// @route   GET /api/v1/ffd/purchasing/requests/request/:uuid
// @access  Private
exports.getRequest = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequest.findOne({
    where: {
      uuid: req.params.uuid
    },
    include: [{
      model: RequestAttachment,
      attributes: ['fileName'],
      order: [['createdAt', 'desc']],
        
    },
    {
      model: RequestApproval
    }]
  })

  if(!request) {
    return next(new ErrorResponse(`Could not return purchase request with uuid ${req.params.uuid}`, 500))
  }

  res.status(200).json({
    success: true,
    data: request
  })
})

// @desc    Create request
// @route   POST /api/v1/ffd/purchasing/requests/create
// @access  Public
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { requestLocation, requestDetails, vendor, requestAmount, weblink, uuid, createdAt, updatedAt } = req.body

  // User object generated by protect middleware
  const createdBy = req.user.email
  const updatedBy = req.user.email

  let fiscalYear 

  // Get current fiscal year
  const getFiscalYear = () => {
    const today = new Date()
    if(today.getMonth() < 6) {
      fiscalYear = today.getFullYear()
    } else {
      fiscalYear = today.getFullYear() + 1
    }
  }

  getFiscalYear()

  const request = await PurchaseRequest.create({
    requestId: "REQ" + fiscalYear + "-" + Math.floor(Date.now() / 1000),
    requestLocation,
    requestDetails,
    vendor,
    requestAmount,
    weblink,
    status: "Pending",
    uuid,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt
  })

  if(!request) {
    return next(new ErrorResponse("Unable to create new request", 500))
  }

  sendPendingApprovalEmail(['andrew.southern@franklintn.gov', 'joanne.finn@franklintn.gov', 'beth.reeser@franklintn.gov'], request, `https://apps.franklintn.gov/ffd-purchasing/approval/${request.uuid}`)
  // sendPendingApprovalEmail(['andrew.southern@franklintn.gov'], request, `https://apps.franklintn.gov/ffd-purchasing/approval/${request.uuid}`)

  res.status(201).json({
    success: true,
    data: request
  })
})

// @desc    Update request
// @route   PUT /api/v1/ffd/purchasing/requests/request/update/:uuid
// @access  Private
exports.updateRequest = asyncHandler(async (req, res, next) => {
  const { requestLocation, requestDetails, vendor, requestAmount, weblink, updatedAt } = req.body

  // User object generated by protect middleware
  const updatedBy = req.user.email

  const requestUpdate = await PurchaseRequest.update({
    requestLocation,
    requestDetails,
    vendor,
    requestAmount,
    weblink,
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

  if(!requestUpdate) {
    return next(new ErrorResponse(`Could not update by uuid ${req.params.uuid}`, 500))
  }

  res.status(200).json({
    success: true,
    data: requestUpdate
  })
})

// @desc    Delete request
// @route   DELETE /api/v1/ffd/purchasing/requests/delete/:uuid
// @access  Private
exports.deleteRequest = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequest.findOne({
    where: {
      uuid: req.params.uuid
    },
    returning: true,
    plain: true
  })

  const { requestId } = request

  if(!requestId) {
    return next(new ErrorResponse(`Could not find project with uuid ${req.params.uuid}`, 500))
  }

  await PurchaseRequest.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  // Delete any associated attachments
  await RequestAttachment.destroy({
    where: {
      requestId
    }
  })

  // Delete any associated approvals
  await RequestApproval.destroy({
    where: {
      requestId
    }
  })

  // Delete any associated purchases and request purchase attachments
  const requestPurchase = await RequestPurchase.findOne({
    where: {
      requestId
    }
  })

  if(requestPurchase) {
    await RequestPurchaseAttachment.destroy({
      where: {
        requestPurchaseId: requestPurchase.requestPurchaseId
      }
    })

    await RequestPurchase.destroy({
      where: {
        requestPurchaseId: requestPurchase.requestPurchaseId
      }
    })
  }

  res.status(200).json({
    success: true,
    data: {}
  })
})

// @desc    Create request approval
// @route   POST /api/v1/ffd/purchasing/requests/approval/create
// @access  Private
exports.createRequestApproval = asyncHandler(async (req, res, next) => {
  const { requestId, departmentApproval, departmentApprovalDate, requiresOfficerApproval, officerApprovalEmail, requiresAP, uuid } = req.body

  const departmentApprovalEmail = req.user.email

  const requestApproval = await RequestApproval.create({
    requestId,
    departmentApproval,
    departmentApprovalEmail,
    departmentApprovalDate,
    requiresOfficerApproval,
    officerApprovalEmail,
    requiresAP,
    uuid
  })

  if(!requestApproval) {
    return next(new ErrorResponse("Could not create request approval", 500))
  }

  const request = await PurchaseRequest.findOne({
    where: {
      requestId
    }
  })

  if(!request) {
    return next(new ErrorResponse(`Could not find project with id #${requestId}`, 500))
  }

  const url = `https://apps.franklintn.gov/ffd-purchasing/approval/${request.uuid}`

  if((requiresAP === true && !requiresOfficerApproval)) {
    await PurchaseRequest.update({
      status: "Approved For AP"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Approved For AP")
  } // Approved by department and does not need officer approval
  else if((departmentApproval === true && requiresOfficerApproval === false)) {
    await PurchaseRequest.update({
      status: "Approved"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Approved", url)
  } // Approved by department and requires officer approval
  else if(departmentApproval && requiresOfficerApproval) {
    await PurchaseRequest.update({
      status: "Pending Officer Approval"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Pending Officer Appoval")
    sendPendingApprovalEmail(officerApprovalEmail, request, url)
  } // Request denied by department 
  else if(!departmentApproval) {
    await PurchaseRequest.update({
      status: "Denied"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Denied")
  }

  res.status(200).json({
    success: true,
    data: requestApproval
  })
})

// @desc    Update request approval
// @route   PUT /api/v1/ffd/purchasing/requests/approval/update/:uuid
// @access  Private
exports.updateRequestApproval = asyncHandler(async (req, res, next) => {
  const { departmentApproval, departmentApprovalEmail, departmentApprovalDate, requiresOfficerApproval, officerApproval, officerApprovalEmail, officerApprovalDate, requiresAP } = req.body

  const approval = await RequestApproval.findOne({
    where: {
      uuid: req.params.uuid
    }
  })

  const { requestId } = approval

  const requestApprovalUpdate = await RequestApproval.update({
    departmentApproval,
    departmentApprovalEmail,
    departmentApprovalDate,
    requiresOfficerApproval,
    officerApproval,
    officerApprovalEmail,
    officerApprovalDate,
    requiresAP
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true,
    plain: true
  })

  if(!requestApprovalUpdate) {
    return next(new ErrorResponse(`Could not update request approval by uuid ${req.params.uuid}`, 500))
  }

  const request = await PurchaseRequest.findOne({
    where: {
      requestId
    }
  })

  if(!request) {
    return next(new ErrorResponse(`Could not find request with ID #${requestId}`, 500))
  }

  const url = `https://apps.franklintn.gov/ffd-purchasing/approval/${request.uuid}`

  if(requiresAP === true) {
    await PurchaseRequest.update({
      status: "Approved For AP"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Approved For AP")
  } // Department approved - does not requires officer approval
  else if ((departmentApproval === true && requiresOfficerApproval === false)) {
    await PurchaseRequest.update({
      status: "Approved"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Approved", url)
  } // Department approved - requires officer approval and is awaiting officer approval
  else if((departmentApproval === true && requiresOfficerApproval === true && (officerApproval === null))) {
    await PurchaseRequest.update({
      status: "Pending Officer Approval"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Pending Officer Approval")
    sendPendingApprovalEmail(officerApprovalEmail, request, url)
  } // Approved by department and officer
  else if((departmentApproval === true && officerApproval === true)) {
    await PurchaseRequest.update({
      status: "Approved"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Approved", url)
  } // Denied by department or officer
  else if((departmentApproval === false || officerApproval === false)) {
    await PurchaseRequest.update({
      status: "Denied"
    },
    {
      where: {
        requestId
      },
      returning: true,
      plain: true
    })

    sendStatusEmail(request, "Denied")
  }

  res.status(201).json({
    success: true,
    data: requestApprovalUpdate
  })
})

// @desc    Delete request approval
// @route   DELETE /api/v1/ffd/purchasing/requests/approval/delete/:uuid
// @access  Private
exports.deleteRequestApproval = asyncHandler(async (req, res, next) => {
  const request = await RequestApproval.findOne({
    where: {
      uuid: req.params.uuid
    },
    attributes: ['requestId']
  })

  const { requestId } = request

  // Set request status to Pending
  await PurchaseRequest.update({
    status: "Pending"
  },
  {
    where: {
      requestId
    },
  })

  res.status(200).json({
    success: true,
    data: {}
  })
})

// @desc    Get requests pending logged in user approval
// @route   GET /api/v1/ffd/purchasing/requests/approval/pending/:email
// @access  Private
exports.getRequestsPending = asyncHandler(async (req, res, next) => {
  const requests = await RequestApproval.findAndCountAll({
    where: {
      officerApprovalEmail: req.user.email,
      officerApproval: null
    },
    attributes: ['requestId']
  })

  let requestIds = []

  if(requests.count > 0) {
    requests.rows.map(row => {
      requestIds.push(row.requestId)
    })
  }

  res.status(200).json({
    success: true,
    data: requestIds
  })
})

// @desc    Reset request
// @route   DELETE /api/v1/ffd/purchasing/requests/request/reset/:uuid
// @access  Private
exports.resetRequest = asyncHandler(async (req, res, next) => {
  const request = await PurchaseRequest.findOne({
    where: {
      uuid: req.params.uuid
    }
  })

  const { requestId } = request

  if(!requestId) {
    return next(new ErrorResponse(`Could not return any request by uuid ${req.params.uuid}`, 500))
  }

  // Reset status to Pending
  await PurchaseRequest.update({
    status: "Pending"
  },
  {
    where: {
      requestId
    }
  })

  // Delete any approvals
  await RequestApproval.destroy({
    where: {
      requestId
    }
  })

  // Find any related purchase
  const purchase = await RequestPurchase.findOne({
    where: {
      requestId
    }
  })

  // If purchase exists - delete any associated request purchase attachments
  if(purchase) {
    // Delete any purchases
    await RequestPurchase.destroy({
      where: {
        requestId
      }
    })
  }

  res.status(200).json({
    success: true,
    data: {}
  })
})