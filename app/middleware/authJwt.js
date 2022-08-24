const jwt = require('jsonwebtoken')
const db = require('./../models')
const User = db.user
const Role = db.role

//Verify if token is valid
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    let token = ''
    try {
        token = authHeader.split(' ')[1]
    } catch (err) {

        return res.status(401).send({ message: "Incorrect token format" })
    }

    jwt.verify(token, process.env.SECRET, (err, data) => {
        if (err) {
            return res.status(403).send({ message: "Token validation failed" })
        }
        User.findById(data.userId).exec((err, user) => {
            if (err) {
                return res.status(500).send({ message: err })
            }

            //if user is not found then send error message
            if (!user) {
                return res.status(404).send({ message: "User not found!" })
            }
            req.userId = user.id
            req.roles = user.roles
            next()
        })
    })
}


//Find a user by id and check if the role exist
const isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }

        if (!user) {
            return res.status(404).send({ message: "Fail! Admin user not found!" })
        }

        if (user.roles !== req.roles) {
            return res.status(403).send({ message: "Fail! Admin account required!" })
        }
    }
    )
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