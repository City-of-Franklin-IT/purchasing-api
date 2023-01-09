const express = require('express')
const { createRequest, updateRequest, deleteRequest, getRequests, getRequest, createRequestApproval, updateRequestApproval, deleteRequestApproval, getRequestsPending, resetRequest } = require('../controllers/requests')
const { createRequestPurchase, updateRequestPurchase, deleteRequestPurchase } = require('../controllers/requestPurchases')
const advancedResults = require('../middleware/requests/advancedResults')
const { PurchaseRequest } = require('../models')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

// Purchase request routes
router
  .post('/create', createRequest)
  .put('/request/update/:uuid', updateRequest)
  .delete('/request/delete/:uuid', deleteRequest)
  .get('/', advancedResults(PurchaseRequest), getRequests)
  .get('/request/:uuid', getRequest)
  .delete('/request/reset/:uuid', resetRequest)

// Request purchase routes
router
  .post('/purchase/create', createRequestPurchase)
  .put('/purchase/update/:uuid', updateRequestPurchase)
  .delete('/purchase/delete/:uuid', deleteRequestPurchase)

// Request approval routes
router
  .post('/approval/create', createRequestApproval)
  .put('/approval/update/:uuid', updateRequestApproval)
  .delete('/approval/delete/:uuid', deleteRequestApproval)
  .get('/approval/pending/:email', getRequestsPending)

module.exports = router