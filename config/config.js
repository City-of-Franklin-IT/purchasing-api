const dotenv = require('dotenv')

dotenv.config({ path: 'config/config.env' })

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "mssql",
    "dialectOptions": {
      useUTC: true
    },
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "mssql",
    "dialectOptions": {
      useUTC: true
    },
  },
  "production": {
    "username": process.env.DB_PROD_USERNAME,
    "password": process.env.DB_PROD_PASSWORD,
    "database": process.env.DB_PROD_DATABASE,
    "host": process.env.DB_PROD_HOST,
    "dialect": "mssql",
    "dialectOptions": {
      useUTC: true
    },
  }
}
