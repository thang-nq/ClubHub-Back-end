const controller = require('./../controllers/search.controller')
const { authJwt } = require('./../middleware')
const Router = require('express').Router()

Router.post('/', authJwt.verifyToken, controller.universalSearch)

module.exports = Router