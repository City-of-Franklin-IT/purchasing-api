// Format dateTime string to format MSSQL accepts
const normalizeDateTime = (dateTime) => {
  const formattedDateTime = dateTime + ":00.000Z"
  return formattedDateTime
}

module.exports = normalizeDateTime