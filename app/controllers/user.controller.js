const db = require('./../models/index')
const User = db.user
const { authJwt } = require('./../middleware')
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

exports.getAllUsers = async (req, res) => {
    const Users = await User.find()
    return res.status(200).send(Users)
}

exports.getUser = (req, res) => {
    let authorities = []
    let user = User.findById(req.userId).populate("roles").exec((err, user) => {

        for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
        }

    }

    )


    user.roles = authorities
    return res.status(200).send(user)
}