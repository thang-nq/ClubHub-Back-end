const express = require('express')
const cors = require('cors');
const dbConnect = require('./app/connection/dbConnect')
const app = express()

const env = require('dotenv')
const mongoose = require('mongoose')
//env
env.config()


//PORT
const PORT = process.env.PORT || 8080

//Allow CORS
app.use(cors());

//parse request of Content-type: Application/json
app.use(express.json())

//parse request of Content-type: Application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

//Connect database
// dbConnect.connect()
mongoose.connect((process.env.MONGOURL), () => {
    console.log('Connect success')
})

//Routes
require('./app/routes/auth.routes')(app)
require('./app/routes/user.routes')(app)


// Tuan's router
// require('./app/routes/comment.routes')(app)

app.use("/comment", commentRoute);


app.listen(PORT, () => {
    console.log('Hello')
    console.log(`Server is running on port ${PORT}.`)
})