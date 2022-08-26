const { verifySignUp, sanitize } = require('./../middleware')
const controller = require('./../controllers/auth.controller')
const Router = require('express').Router();


//signup route
//Add Sanitize all req for signup and signin
Router.post(
    "/signup",
    [
        // sanitize.sanitizeSignupRequest,
        verifySignUp.checkDuplicateEmail,
        verifySignUp.checkDuplicateUsername
    ],
    controller.signup
)

//signin route
Router.post(
    "/signin",
    // sanitize.sanitizeSigninRequest,
    controller.signin
)

//Email verification route
Router.get(
    "/confirm/:confirmationCode", controller.verifyUser
)

module.exports = Router