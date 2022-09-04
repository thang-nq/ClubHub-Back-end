const controller = require('./../controllers/president.controller')
const { authJwt } = require('./../middleware')
const Router = require('express').Router()

// Club president get club info
Router.get('/myclub/', [authJwt.verifyToken], controller.getClubInfo)

// President update club info
Router.put('/myclub/update', [authJwt.verifyToken], controller.updateClub)

// Get all pending club join request
Router.get('/myclub/request', [authJwt.verifyToken], controller.getClubJoinRequest)

//Accept or reject a member to the club
Router.post("/myclub/request/", [authJwt.verifyToken], controller.approveOrRecjectMember)

//Club president get all members
Router.get('/myclub/members', [authJwt.verifyToken], controller.getAllClubMembers)

// Club president change member role
Router.put('/myclub/members/', [authJwt.verifyToken], controller.clubMemberSetRole)

// Club president kick member
Router.delete('/myclub/members/:userId', [authJwt.verifyToken], controller.kickMember)


module.exports = Router