const controller = require('./../controllers/admin.controller')
const { authJwt } = require('./../middleware')
const Router = require('express').Router()


// Get club create requests
Router.get("/clubrequests", [authJwt.verifyToken, authJwt.isAdmin], controller.getClubCreateRequests)

// Approve club create requests
Router.post("/clubrequests/approve", [authJwt.verifyToken, authJwt.isAdmin], controller.approveClubCreateRequests)

// 