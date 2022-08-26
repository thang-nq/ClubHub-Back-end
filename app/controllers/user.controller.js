const db = require('./../models/index')
const User = db.user
const { authJwt } = require('./../middleware')
const { avatarUpload } = require('./../middleware')
const { s3, handler } = require('./../handler/handler')

// Get all users (full info - admin access required)
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



exports.updateUserAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: "Need a file (jpg, jpeg, png) to upload" })
        }
        const user = await User.findByIdAndUpdate(req.userId, { "avatarUrl": req.file.location })

        return res.status(200).send(user)

    } catch (error) {
        return res.status(500).send(error.message)
    }
}