//Config for email verification
const nodemailer = require('nodemailer')
// const config = require('./auth.config')

const user = process.env.EMAIL
const password = process.env.EMAILPW

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: user,
        pass: password
    }
})

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log('Sent email')
    transport.sendMail({
        from: user,
        to: email,
        subject: "RMIT Club Hub Account Verification",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for registering. Please confirm your email by clicking on the following link</p>
        <a href=https://rmit-club.herokuapp.com/api/auth/confirm/${confirmationCode}> Click here</a>
        </div>`
    })
}