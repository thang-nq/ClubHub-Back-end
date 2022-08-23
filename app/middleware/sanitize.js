

const sanitizeSignupRequest = (req, res, next) => {
    let testResult = {
        message: 'Pass',
        result: true
    }
    //Check missing input
    if (!req.body.email || !req.body.password || !req.body.username || !req.body.dob) {
        testResult.result = false
        testResult.message = "Missing one of the required parameter"
        return res.status(400).send({ message: testResult.message })
    }

    //Check email format 
    const emailRegex = "^[A-Za-z0-9._%+-]+@rmit.edu.vn"
    const passwordTest = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    if (!req.body.email.match(emailRegex)) {
        testResult.result = false
        testResult.message = "Rmit email address required"
        return res.status(400).send({ message: testResult.message })
    }

    //and password strength
    if (!passwordTest.test(req.body.password)) {
        testResult.result = false
        testResult.message = "Password not meet the requirement"
        return res.status(400).send({ message: testResult.message })
    }

    return next()
}

const sanitize = {
    sanitizeSignupRequest
}

module.exports = sanitize;