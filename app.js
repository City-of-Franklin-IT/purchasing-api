const express = require('express')
const hpp = require('hpp')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const errorHandler = require('./middleware/error')

const app = express()

// Request bosy parser
app.use(express.json())

// Set security headers
app.use(helmet())

// Prevent http param pollution
app.use(hpp())

// Prevents XSS attacks
app.use(xss())

// Enable CORS
app.use(cors())
app.options('*', cors())
app.set('port', process.env.PORT)

// Route files
const purchasingLdap = require('./routes/ldap')
const requests = require('./routes/requests')
const purchases = require('./routes/purchases')
const attachments = require('./routes/attachments')

// Mount routers
app.use('/api/v1/purchasing/ffd/ldap', purchasingLdap)
app.use('/api/v1/purchasing/ffd/requests', requests)
app.use('/api/v1/purchasing/ffd/purchases', purchases)
app.use('/api/v1/purchasing/ffd/attachments', attachments)

// Error handler
app.use(errorHandler)

const port = process.env.PORT

app.listen({ port }, async () => {
  console.log(`Server up on ${process.env.HOST}:${process.env.PORT} in ${process.env.NODE_ENV} mode..`)
})