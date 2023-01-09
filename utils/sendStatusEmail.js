const sendEmail = require('./sendEmail')

const sendStatusEmail = async (request, newStatus) => {
  const message = `Request ${request.requestId} - "${request.requestDetails}" status has changed from "${request.status}" to "${newStatus}".`

  await sendEmail({
    email: request.createdBy,
    subject: `There has been an update to FFD purchasing request #${request.requestId} - "${request.requestDetails}".`,
    message
  })
}

module.exports = sendStatusEmail