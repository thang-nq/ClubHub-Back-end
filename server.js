const express = require('express')
const cors = require('cors');
const dbConnect = require('./app/connection/dbConnect')
const app = express()

const env = require('dotenv')
const postRoute = require('./app/routes/post.routes')
const authRoute = require('./app/routes/auth.routes')
const userRoute = require('./app/routes/user.routes')
const commentRoute = require('./app/routes/comment.routes')
const clubRoute = require('./app/routes/club.routes')
const presidentRoute = require('./app/routes/president.routes')
const adminRoute = require('./app/routes/admin.routes')
//Test route for debugging
const testRoute = require('./app/routes/test.routes')

const morgan = require('morgan');


//env
env.config()

//PORT
const PORT = process.env.PORT || 8080

// Request log
app.use(morgan('short'))

//Allow CORS
app.use(cors());

//parse request of Content-type: Application/json
app.use(express.json())

//parse request of Content-type: Application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

//SSR
app.set('views', './views')
app.set('view engine', 'pug')

//Connect database
dbConnect.connect()

//Routes
app.use("/api/user", userRoute)
app.use("/api/posts", postRoute)
app.use("/api/auth", authRoute)
app.use("/api/clubs", clubRoute)
app.use("/api/comment", commentRoute);
app.use("/api/president", presidentRoute)
app.use("/api/admin", adminRoute)
app.use("/test", testRoute)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})