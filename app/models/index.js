const mongoose = require('mongoose')


const db = {}

db.mongoose = mongoose
db.user = require('./auth/user.model')
db.role = require('./auth/role.model')
db.ROLES = ["user", "admin", "clubprez"]
db.post = require('./Post/post.model')
module.exports = db