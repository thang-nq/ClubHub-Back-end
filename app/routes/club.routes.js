const controller = require('./../controllers/club.controller')
const { authJwt, sanitize } = require('./../middleware')
const router = require('express').Router()
const { uploadLogo } = require('./../handler/handleImagesUpload')
const { isClubPrez, isAdmin } = require('../middleware/authJwt')

// CRUD
// Get all club
router.get("/", controller.getAllClub)

// Create a club (need accessToken)
router.post("/", [authJwt.verifyToken, authJwt.isClubPrez, sanitize.sanitizeClubRequest], controller.createClub)

//Update a club logo
router.post("/:id", [authJwt.verifyToken, authJwt.isClubPrez, uploadLogo], controller.updateClubLogo)

// Update a club (need accessToken)
router.put("/:id", [authJwt.verifyToken, authJwt.isClubPrez], controller.updateClub)

// Delete a club (need accessToken)
router.delete("/:id", [authJwt.verifyToken, isAdmin], controller.deleteClub)

// Request to join a club
router.post("/:id/join", [authJwt.verifyToken], controller.requestToJoinClub)

// Get a club info
router.post("/:id", controller.getClub)


module.exports = router

