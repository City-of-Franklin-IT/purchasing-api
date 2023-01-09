const express = require('express')
const { loginUser, getMe } = require('../controllers/ldap')
const { protect } = require('../middleware/auth')

const router = express.Router()

// LDAP authentication
router
  .post('/login', loginUser)
  .get('/auth', protect, getMe)

module.exports = router