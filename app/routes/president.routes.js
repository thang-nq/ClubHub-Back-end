const controller = require('./../controllers/president.controller')
const { authJwt } = require('./../middleware')
const Router = require('express').Router()

// Get all pending club join request
Router.get('/myclub/:clubId/request', [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember], controller.getClubJoinRequest)

//Accept or reject a member to the club
Router.post("/myclub/:clubId/request/", [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember], controller.approveOrRecjectMember)

//Club president get all members
Router.get('/myclub/:clubId/members', [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember], controller.getAllClubMembers)

// Club president change member role
Router.post('/myclub/:clubId/members', [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember], controller.clubMemberSetRole)



module.exports = Router