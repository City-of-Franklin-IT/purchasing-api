const sendEmail = require('./sendEmail')

const sendStatusEmail = async (request, newStatus, url) => {
  let message
  if(newStatus === 'Approved') {
    message = `Request ${request.requestId} - "${request.requestDetails}" status has changed from "${request.status}" to "${newStatus}".\n\nPlease visit ${url} to submit purchase.`
  } else if(newStatus === 'Approved For AP') {
    message = `Request ${request.requestId} - "${request.requestDetails}" status has changed from "${request.status}" to "${newStatus}".\n\nPurchase will be completed by Finance Department - no additional actions are currently necessary.`
  } else message = `Request ${request.requestId} - "${request.requestDetails}" status has changed from "${request.status}" to "${newStatus}".`

  await sendEmail({
    email: request.createdBy,
    subject: `There has been an update to FFD purchasing request #${request.requestId} - "${request.requestDetails}".`,
    message
  })
}

module.exports = sendStatusEmail