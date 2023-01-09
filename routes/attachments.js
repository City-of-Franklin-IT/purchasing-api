const express = require('express')
const multer = require('multer')
const { createAttachment, getAttachment, deleteAttachment } = require('../controllers/attachments')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router
  .post('/create', multer().single('file'), createAttachment)
  .post('/attachment/download/:uuid', getAttachment)
  .delete('/attachment/delete/:uuid', deleteAttachment)

module.exports = router