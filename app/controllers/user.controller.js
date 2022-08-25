const db = require('./../models/index')
const User = db.user
const { authJwt } = require('./../middleware')


// Test routes
exports.allAccess = (req, res) => {
    res.status(200).send("Public content")
}

exports.userBoard = (req, res) => {
    res.status(200).send("User content")
}

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin content")
}

exports.clubprezBoard = (req, res) => {
    res.status(200).send("Club President content")
}
//

// Get all users
exports.getAllUsers = async (req, res) => {
    try {

        const Users = await User.find()
        return res.status(200).send(Users)
    } catch (err) {
        return res.status(500).send(err)
    }
}


// User - Personal information (accessToken require)
exports.getUser = async (req, res) => {
    try {

        const user = await User.findById(req.userId)
        return res.status(200).send(user)
    } catch (err) {
        return res.status(500).send(err)
    }
}