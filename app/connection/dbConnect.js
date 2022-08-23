//Connect to mongoDB and create roles

const db = require('./../models')

const Role = db.role

// mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
// useNewUrlParser: true,
// useUnifiedTopology: true}

const connect = () => {
    db.mongoose
        .connect(process.env.MONGOURL)
        .then(() => {
            console.log("Successfully connect to MongoDB")
            initial()
        })
}


//Add roles to the collection
function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err)
                }
                console.log("added 'user' to roles collection")
            })

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err)
                }
                console.log("added 'admin' to roles collection")
            })

            new Role({
                name: "clubprez"
            }).save(err => {
                if (err) {
                    console.log("error", err)
                }
                console.log("added 'clubprez' to roles collection")
            })
        }
    })
}

const dbConnect = {
    connect
}

module.exports = dbConnect