const db = require('./../models/index')
const User = db.user


// Get all users (full info - admin access required)
exports.getAllUsers = async (req, res) => {
    try {
        const userQuery = req.query.banned
        console.log(userQuery)
        let users = []
        if (userQuery === "true") {
            users = await User.find({ accstatus: "Banned" })
        } else {
            users = await User.find({ accstatus: "Active" })
        }

        return res.status(200).send(users)
    } catch (err) {
        return res.status(500).send(err)
    }
}


// User - Personal information (accessToken require)
exports.getUser = async (req, res) => {
    try {

        const user = await User.findById(req.userId).populate("clubs")
        return res.status(200).send(user)
    } catch (err) {
        return res.status(500).send(err)
    }
}

// Admin - get user
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        if (!user) {
            return res.status(404).send({ message: "User not found!" })
        }
        return res.status(200).send(user)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// User - Update personal information
exports.updateUser = async (req, res) => {

    // All error handled at verify token
    try {
        const userToUpdate = await User.findById(req.userId)
        const usernameRegex = "^[A-Za-z0-9._-]{8,16}$"
        if (req.body.username) {
            const processUsername = req.body.username.trim().toLowerCase()
            if (!processUsername.match(usernameRegex)) {
                return res.status(400).send({ message: "Error, username not valid, wrong format (8-16 characters)" })
            }
            const duplicateUser = await User.findOne({ username: processUsername })
            if (duplicateUser) {
                return res.status(401).send({ message: "Error, username already exist" })
            }
            userToUpdate.username = req.body.username
        }

        userToUpdate.name = req.body.name || userToUpdate.name
        userToUpdate.dob = req.body.dob || userToUpdate.dob
        userToUpdate.phone = req.body.phone || userToUpdate.phone
        userToUpdate.gender = req.body.gender || userToUpdate.gender

        await userToUpdate.save()
        return res.status(200).send({ message: "Update user sucess!", userToUpdate })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// User - Update user avatar
exports.updateUserAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: "Need a file (jpg, jpeg, png) to upload" })
        }
        const user = await User.findById(req.userId)
        user.avatarUrl = req.file.location
        const saveUser = await user.save()
        return res.status(200).send(saveUser)

    } catch (error) {
        return res.status(500).send(error.message)
    }
}

// User - test route
exports.testTemp = async (req, res) => {
    try {
        return res.render('test')
    } catch (error) {
        return res.status(500).send()
    }
}