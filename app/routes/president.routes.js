const controller = require('./../controllers/president.controller')
const { authJwt } = require('./../middleware')
const Router = require('express').Router()

// Get all pending club request
Router.get('/myclub/:clubId/request', [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember], controller.getClubJoinRequest)

//Accept a member to the club
Router.post("/myclub/:clubId/request/:requestId/accept", [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember], controller.approveMember)

// Club president change member role

module.exports = Router