//Connect to mongoDB and create roles

const db = require('./../models')
const env = require('dotenv')
env.config()



const connect = () => {
    db.mongoose
        .connect(process.env.MONGOURL)
        .then(() => {
            console.log("Successfully connect to MongoDB")

        })
}



const dbConnect = {
    connect
}

module.exports = dbConnect