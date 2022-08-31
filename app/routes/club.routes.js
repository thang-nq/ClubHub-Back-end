const controller = require('./../controllers/club.controller')
const { authJwt, sanitize } = require('./../middleware')
const router = require('express').Router()
const { uploadLogo, uploadBackground } = require('./../handler/handleImagesUpload')
const { isClubPrez, isAdmin } = require('../middleware/authJwt')

// CRUD
// Get all club
router.get("/", controller.getAllClub)

// Create a club (need accessToken)
router.post("/", [authJwt.verifyToken, authJwt.isClubPrez, sanitize.sanitizeClubRequest], controller.createClub)

//Update a club logo
router.post("/:clubId", [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember, uploadLogo], controller.updateClubLogo)

// Update/Upload a club background image
router.post("/:clubId", [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember, uploadBackground], controller.updateClubBackgroundImage)

// Update a club (need accessToken)
router.put("/:clubId", [authJwt.verifyToken, authJwt.isClubPrez, authJwt.isClubMember], controller.updateClub)

// Delete a club (need accessToken)
router.delete("/:clubId", [authJwt.verifyToken, isAdmin], controller.deleteClub)

// Request to join a club
router.post("/:clubId/join", [authJwt.verifyToken], controller.requestToJoinClub)

// Get a club info
router.get("/:clubId", controller.getClub)


module.exports = router

