const controller = require('./../controllers/club.controller')
const { authJwt, sanitize } = require('./../middleware')
const router = require('express').Router()
const { uploadLogo, uploadBackground } = require('./../handler/handleImagesUpload')


// CRUD
// Get all club
router.get("/", controller.getAllClub)

// Create a club 
router.post("/", [authJwt.verifyToken], controller.createClub)

//Update a club logo, president account required
router.put("/:clubId/logo", [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember, uploadLogo], controller.updateClubLogo)

// Update/Upload a club background image
router.put("/:clubId/bg", [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember, uploadBackground], controller.updateClubBackgroundImage)



// Delete a club (need accessToken)
router.delete("/:clubId", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteClub)

// Request to join a club
router.post("/:clubId/join", [authJwt.verifyToken, authJwt.isNotClubMember], controller.requestToJoinClub)

// Get a club info
router.get("/:clubId", controller.getClub)


module.exports = router

