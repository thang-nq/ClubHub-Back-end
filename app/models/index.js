const mongoose = require('mongoose')


const db = {}

db.mongoose = mongoose
db.user = require('./auth/user.model')
db.ROLES = ["user", "admin", "clubprez"]
db.post = require('./Post/post.model')
db.club = require('./Club/club.model')
db.comment = require('./Comment/comment.model')
db.event = require('./Event/event.model')
module.exports = db