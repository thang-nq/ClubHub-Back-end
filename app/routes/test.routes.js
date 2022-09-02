const Router = require('express').Router()
const db = require('./../models')
const Club = db.club
const User = db.user
const JoinClubRQ = db.joinrequest

Router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        return res.status(200).send(user)
    } catch (error) {
        return res.status(500).send(error)
    }
})


module.exports = Router