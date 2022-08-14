const config = require("./../config/auth.config")
const db = require('./../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = db.user
const Role = db.role

exports.signup = (req, res) => {
    const user = new User({
        email: req.body.email,
        name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 8)
    })
    user.save((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                (err, roles) => {
                    if (err) {
                        return res.status(500).send({ message: err })
                    }
                    user.roles = roles.map(role => role._id)
                    user.save(err => {
                        if (err) {
                            return res.status(500).send({ message: err })

                        }
                        return res.status(200).send({ message: "Sign up successfully!" })
                    })
                }
            )
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    return res.status(500).send({ message: err })
                }
                user.roles = [role._id];
                user.save(err => {
                    if (err) {
                        return res.status(500).send({ message: err })
                    }

                    return res.status(200).send({ message: "Sign up as user successfully!" })
                })
            })
        }
    })
}

exports.signin = (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({ message: err })
            }
            if (!user) {
                return res.status(404).send({ message: "Email not found!" })
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            )
            if (!passwordIsValid) {
                return res.status(401).send({ accessToken: null, message: "Incorrect password" })
            }

            let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 })
            let authorities = []
            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
            }
            return res.status(200).send({
                id: user._id,
                email: user.email,
                name: user.name,
                roles: authorities,
                accessToken: token
            })
        })
}
