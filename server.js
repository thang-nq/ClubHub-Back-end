const express = require('express')
const cors = require('cors');
const dbConnect = require('./app/connection/dbConnect')
const app = express()

const env = require('dotenv')
const postRoute = require('./app/routes/post.routes')
const authRoute = require('./app/routes/auth.routes')
const userRoute = require('./app/routes/user.routes')

//env
env.config()


//PORT
const PORT = process.env.PORT || 8080

//Allow CORS
app.use(cors());

//parse request of Content-type: Application/json
app.use(express.json())

//parse request of Content-type: Application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

//Connect database
dbConnect.connect()

//Routes
app.use("/api", userRoute)
app.use("/api/posts", postRoute)
app.use("/api/auth", authRoute)


// Em tuan chicken
// Comment routes

// app.use("/comment", commentRoute)


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})