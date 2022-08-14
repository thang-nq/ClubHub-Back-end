const jwt = require('jsonwebtoken')
const config = require('./../config/auth.config')
const db = require('./../models')
const User = db.user
const Role = db.role

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    let token = ''
    try {
        token = authHeader.split(' ')[1]
    } catch (err) {

        return res.status(401).send({ message: "Invalid token format" })
    }

    jwt.verify(token, config.secret, (err, data) => {
        if (err) {
            return res.status(403).send({ message: err })
        }
        req.userId = data.id
        next()
    })
}

//Find a user by id and check if the role exist
const isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    return res.status(500).send({ message: err })
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        return next()
                    }
                }

                //if there is no "admin role" then send error message
                return res.status(403).send({ message: "Require administator account!" })
            }
        )
    })
}

const isClubPrez = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    return res.status(500).send({ message: err })
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "clubprez") {
                        return next()
                    }
                }

                //if there is no "admin role" then send error message
                return res.status(403).send({ message: "Require club president account!" })
            }
        )
    })
}

const authJwt = {
    verifyToken,
    isAdmin,
    isClubPrez
}

module.exports = authJwt