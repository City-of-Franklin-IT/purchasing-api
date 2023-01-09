const sendEmail = require('./sendEmail')

const sendPendingApprovalEmail = async (email, request, url) => {
  const message = `There is a FFD purchasing request pending your approval.\n\nRequest ${request.requestId} - "${request.requestDetails}" submitted by ${request.createdBy} on ${request.createdAt}.\n\nPlease visit ${url} to complete the approval process.`

  await sendEmail({
    email: email,
    subject: `Purchasing request pending approval`,
    message
  })
}

module.exports = sendPendingApprovalEmail