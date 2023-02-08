const fs = require('fs')
const path = require('path')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const { RequestAttachment, PurchaseAttachment, RequestPurchaseAttachment } = require('../models')
const writeFile = require('../utils/writeFile')

// @desc    Create attachment
// @route   POST /api/v1/ffd/purchasing/attachments/create
// @access  Private
exports.createAttachment = asyncHandler(async (req, res, next) => {
  const { requestId, purchaseId, requestPurchaseId } = req.body

  const createdBy = req.user.email
  const updatedBy = req.user.email
  
  const { originalname } = req.file
  const fileType = path.extname(originalname)

  let existingAttachments

  if(requestId) {
    existingAttachments = await RequestAttachment.findAndCountAll({
      where: {
        requestId
      }
    })

    const fileName = requestId + "_" + (existingAttachments.count + 1) + fileType

    await RequestAttachment.create({
      requestId,
      fileName,
      data: req.file.buffer,
      createdBy,
      updatedBy
    })
  } else if(purchaseId) {
    existingAttachments = await PurchaseAttachment.findAndCountAll({
      where: {
        purchaseId
      }
    })

    const fileName = purchaseId + "_" + (existingAttachments.count + 1) + fileType

    await PurchaseAttachment.create({
      purchaseId,
      fileName,
      data: req.file.buffer,
      createdBy,
      updatedBy
    })
  } else if(requestPurchaseId) {
    existingAttachments = await RequestPurchaseAttachment.findAndCountAll({
      where: {
        requestPurchaseId
      }
    })

    const fileName = requestPurchaseId + "_" + (existingAttachments.count + 1) + fileType

    await RequestPurchaseAttachment.create({
      requestPurchaseId,
      fileName,
      data: req.file.buffer,
      createdBy,
      updatedBy
    })
  }

  res.status(200).json({
    success: true,
    msg: "File Uploaded"
  })
})

// @desc    Download attachment
// @route   GET /api/v1/ffd/purchasing/attachments/download/:uuid
// @access  Private
exports.getAttachment = asyncHandler(async (req, res, next) => {
  let attachment

  if(req.body.type === 'request') {
    attachment = await RequestAttachment.findOne({
      where: {
        uuid: req.params.uuid
      }
    })
  } else if(req.body.type === 'purchase') {
    attachment = await PurchaseAttachment.findOne({
      where: {
        uuid: req.params.uuid
      }
    })
  } else if(req.body.type === 'requestPurchase') {
    attachment = await RequestPurchaseAttachment.findOne({
      where: {
        uuid: req.params.uuid
      }
    })
  }

  if(!attachment) {
    return next(new ErrorResponse("Unable to download attachment", 500))
  }

  await writeFile(process.env.FILE_DOWNLOAD_PATH + "/purchasing/attachments/" + `${attachment.fileName}`, attachment.data)

  res.download(process.env.FILE_DOWNLOAD_PATH + "/purchasing/attachments/" + `${attachment.fileName}`, () => {
    fs.unlink(process.env.FILE_DOWNLOAD_PATH + "/purchasing/attachments/" + `${attachment.fileName}`, () => {
      console.log('File Deleted')
    })
  })
})

// @desc    Delete attachment
// @route   DELETE /api/v1/ffd/purchasing/attachments/attachment/delete/:uuid
// @access  Private
exports.deleteAttachment = asyncHandler(async (req, res, next) => {
  if(req.body.type === 'request') {
    await RequestAttachment.destroy({
      where: {
        uuid: req.params.uuid
      }
    })
  } else if(req.body.type === 'purchase') {
    await PurchaseAttachment.destroy({
      where: {
        uuid: req.params.uuid
      }
    })
  } else if(req.body.type === 'requestPurchase') {
    await RequestPurchaseAttachment.destroy({
      where: {
        uuid: req.params.uuid
      }
    })
  }

  res.status(200).json({
    success: true,
    data: {}
  })
})