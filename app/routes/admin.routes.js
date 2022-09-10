const controller = require('./../controllers/admin.controller')
const { authJwt } = require('./../middleware')
const Router = require('express').Router()


// Get club create requests
Router.get("/clubrequests", [authJwt.verifyToken, authJwt.isAdmin], controller.getClubCreateRequests)

// Search user that not belong to a club
Router.post("/users/search", [authJwt.verifyToken, authJwt.isAdmin], controller.searchUserNotInClub)

// Set club status
Router.put("/clubs/:clubId", [authJwt.verifyToken, authJwt.isAdmin], controller.setClubStatus)

// Get all clubs
Router.get("/allclubs", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllClub)

// Delete a club
Router.delete("/clubs/:clubId", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteClub)

// Update a user account status
Router.put("/users/:userId", [authJwt.verifyToken, authJwt.isAdmin], controller.setUserAccountStatus)

// Add user to club
Router.put("/members/add", [authJwt.verifyToken, authJwt.isAdmin], controller.addUserToClub)

// Remove a user from club
Router.delete("/clubs/members/remove", [authJwt.verifyToken, authJwt.isAdmin], controller.removeUserFromClub)

// Set club member role 
Router.put("/clubs/members/role", [authJwt.verifyToken, authJwt.isAdmin], controller.changeMemberRole)

// Delete a user
Router.delete("/users/delete/:userId", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteUser)

module.exports = Router