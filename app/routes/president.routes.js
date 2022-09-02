const controller = require('./../controllers/president.controller')
const { authJwt } = require('./../middleware')
const Router = require('express').Router()

// Club president get club info
Router.get('/myclub/', [authJwt.verifyToken, authJwt.isClubPrez], controller.getClubInfo)


// Get all pending club join request
Router.get('/myclub/request', [authJwt.verifyToken, authJwt.isClubPrez], controller.getClubJoinRequest)

//Accept or reject a member to the club
Router.post("/myclub/request/", [authJwt.verifyToken, authJwt.isClubPrez], controller.approveOrRecjectMember)

//Club president get all members
Router.get('/myclub/members', [authJwt.verifyToken, authJwt.isClubPrez], controller.getAllClubMembers)

// Club president change member role
Router.post('/myclub/members', [authJwt.verifyToken, authJwt.isClubPrez], controller.clubMemberSetRole)

// Club president kick member
Router.delete('/myclub/members/:userId', [authJwt.verifyToken, authJwt.isClubPrez], controller.kickMember)


module.exports = Router