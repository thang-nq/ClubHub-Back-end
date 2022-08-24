//Connect to mongoDB and create roles

const db = require('./../models')



// mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
// useNewUrlParser: true,
// useUnifiedTopology: true}

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