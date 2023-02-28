const sendEmail = require('./sendEmail')

const sendPurchaseEmail = async (email, purchase) => {
  const message = `A purchase has been submitted by ${purchase.createdBy}.\n\nPlease visit https://apps.franklintn.gov/ffd-purchasing to view details or take further action.`

  await sendEmail({
    email: email,
    subject: "New FFD purchasing submission",
    message
  })
}

module.exports = sendPurchaseEmail