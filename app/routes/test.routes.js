const Router = require('express').Router()
const db = require('./../models')
const Club = db.club
const User = db.user
const JoinClubRQ = db.joinrequest

Router.get("/", async (req, res) => {
    try {

        return res.status(200).send("Test")
    } catch (error) {
        return res.status(500).send(error)
    }
})


module.exports = Router