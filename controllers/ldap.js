const ldap = require('ldapjs')
const jwt = require('jsonwebtoken')
const asyncHandler = require('../middleware/async')

// @desc      Login user
// @route     POST /api/v1/cip/ldap/login
// @access    Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  let username = req.body.email
  username = username.split('@')[0]
  password = req.body.password

  const client = ldap.createClient({
    url: [`${process.env.LDAP_SERVER}`]
  })

  client.on('error', (err) => {
    console.log(err)
  })

  const bind = async () => {
    return new Promise((resolve, reject) => {
      client.bind(`COF\\${username}`, `${password}`, (err) => {
        if(err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    }).catch(error => console.log(error))
  }

  const authenticated = await bind()

  if(!authenticated) {
    return res.status(401).json({
      success: false,
      msg: 'Authentication Error'
    })
  }
  
  const search = async (dc, options) => {
    return new Promise((resolve, reject) => {
      items = []

      client.search(dc, options, (err, res) => {
        res.on('searchRequest', (searchRequest) => {
          console.log(('searchRequest: ', searchRequest.messageID))
        })

        res.on('searchEntry', (entry) => {
          items.push(entry.object.dn)
        })

        res.on('error', async (err) => {
          console.log(err)
          reject(err)
        })
      
        res.on('end', (res) => {
          console.log('status : ' + res.status)
          resolve(items)
        })
      })
    }).catch(error => console.log(error))
  }

  // Search Information Systems members in AD, if found return role = "Admin"
  let options = {
    filter: `(&(sAMAccountName=${username})(memberOf=cn=Information Systems,cn=Users,dc=franklin-gov,dc=com))`,
    scope: 'sub',
  }

  let results = await search('dc=franklin-gov, dc=com', options)

  if(Object.keys(results).length > 0) {
    let userObj = {
      email: username + "@franklintn.gov",
      role: "Admin"
    }

    return sendTokenResponse(userObj, 200, res)
  } // Search Fire Administration members in AD, if match return role = "Admin"
    else if(Object.keys(results).length === 0) {
    options = {
      filter: `(&(sAMAccountName=${username})(memberOf=cn=Fire Purchasing,cn=Users,dc=franklin-gov,dc=com))`,
      scope: 'sub',
    }

    let results = await search('dc=franklin-gov, dc=com', options)

    console.log(results)

    if(Object.keys(results).length > 0) {
      let userObj = {
        email: username + "@franklintn.gov",
        role: "Admin"
      }

      return sendTokenResponse(userObj, 200, res)
    } // All other users return role = "Editor"
      else {
      let userObj = {
        email: username + "@franklintn.gov",
        role: "Editor"
      }

      return sendTokenResponse(userObj, 200, res)
    }
  }
})

const getSignedJwtToken = function (userObj) {
  return jwt.sign(userObj, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// Get token from model
const sendTokenResponse = (userObj, statusCode, res) => {
  // Create token
  const token = getSignedJwtToken(userObj)

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    })
}

// @desc      Get current logged in user
// @route     GET /api/v1/ldap/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = req.user
  
  res.status(200).json({
    success: true,
    data: user
  })
})