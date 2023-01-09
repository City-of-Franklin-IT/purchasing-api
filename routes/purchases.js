const express = require('express')
const advancedResults = require('../middleware/purchases/advancedResults')
const { Purchase } = require('../models')
const { protect } = require('../middleware/auth')
const { createPurchase, updatePurchase, deletePurchase, getPurchases, getPurchase } = require('../controllers/purchases')

const router = express.Router()

// Purchase routes
router
  .post('/create', protect, createPurchase)
  .put('/purchase/update/:uuid', protect, updatePurchase)
  .delete('/purchase/delete/:uuid', protect, deletePurchase)
  .get('/', protect, advancedResults(Purchase), getPurchases)
  .get('/purchase/:uuid', protect, getPurchase)

module.exports = router